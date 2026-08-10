import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const parser = new Parser({
  customFields: {
    item: [
      ['ht:approx_traffic', 'approx_traffic'],
      ['ht:news_item', 'news_item', { keepArray: true }],
    ],
  }
});

// Helper to get Year-Week format (e.g., 2026-W02)
function getYearWeekString(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

function parseToISODate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return d.toISOString().split('T')[0];
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

async function scrapeArticleData(url: string): Promise<{ text: string; imageUrl: string }> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, iframe, header, noscript, .ad, .advertisement').remove();

    // Extract main text (paragraphs)
    let text = '';
    $('p').each((_, element) => {
      const pText = $(element).text().trim();
      if (pText.length > 50) { // Filter out short nav/footer links
        text += pText + '\n\n';
      }
    });

    // Extract Open Graph image if available
    let imageUrl = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content') || '';

    // Fallback to placeholder if relative URL or missing
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = '';
    }

    return { text: text.trim(), imageUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { text: '', imageUrl: '' };
  }
}

async function main() {
  const regions = ['US', 'GB', 'DE'];
  const historyPath = path.join(process.cwd(), 'scripts', 'history.json');
  let history: string[] = [];

  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch {
      console.warn("Could not parse history.json, starting fresh.");
    }
  }

  const TARGET_PER_REGION = 2;

  for (const region of regions) {
    console.log(`\n--- Processing Region: ${region} ---`);
    let feed;
    try {
      feed = await parser.parseURL(`https://trends.google.com/trending/rss?geo=${region}`);
    } catch (error) {
      console.error(`Failed to fetch Google Trends RSS for ${region}:`, error);
      continue;
    }

    if (!feed.items || feed.items.length === 0) {
      console.log(`No trending items found for ${region}.`);
      continue;
    }

    let regionProcessed = 0;

    for (const item of feed.items) {
      if (regionProcessed >= TARGET_PER_REGION) break;

      const title = item.title || 'Unknown';
      
      const slugifiedTitle = slugify(title, { lower: true, strict: true });
      if (history.includes(slugifiedTitle)) {
        console.log(`Skipping already covered trend: ${title}`);
        continue;
      }

      if (!item.news_item || item.news_item.length === 0) continue;
      
      const newsLink = item.news_item[0]['ht:news_item_url'][0];
      console.log(`Analyzing trend (${regionProcessed + 1}/${TARGET_PER_REGION} for ${region}): ${title} - fetching ${newsLink}`);
      
      let { text, imageUrl } = await scrapeArticleData(newsLink);
      if (text.length <= 150) {
        text = `Headline trend: ${title}. Provide a full in-depth news analysis explaining what happened, key background details, and why this matters to the public.`;
      }

      const selectedTrend = title;
      const articleText = text;
      const articleImage = imageUrl || '/images/placeholder.jpg';
      history.push(slugifiedTitle);

      console.log(`Selected trend for ${region}: ${selectedTrend}`);
      console.log(`Generating article with Gemini...`);

      const prompt = `
You are a top-tier journalist and Chief Editor for a modern digital news site called "WhyThisBuzz".
Your writing style is engaging, punchy, clear, and analytical. You explain not just what happened, but *why* it matters.

I will provide you with the raw scraped text from a trending news article about "${selectedTrend}".
Your task is to re-write this article completely in your own words, adhering strictly to the "WhyThisBuzz" style.
Add a catchy title, a short summary, and use Markdown for formatting (headers, bold text, bullet points if needed).

Important formatting requirement:
The output MUST be a valid MDX file, starting immediately with frontmatter enclosed in '---', and then the article body.

You must categorize this article into exactly ONE of the following valid categories:
- "Sports": If the article is about athletes, games, teams, drafts, or matches.
- "Entertainment": If the article concerns celebrities, musicians, TV shows, or pop culture.
- "Movies": If the article specifically focuses on a film, box office, actors in a film role, or cinema news.
- "Technology": If the article is about gadgets, software, AI, companies like Apple/Google, or scientific breakthroughs.
- "Social-Media": If the article revolves around platforms like TikTok, X (Twitter), Instagram, influencers, or viral trends.
- "World Affairs": If the article is about politics, international news, economics, major crime, or general world events not fitting the others.

CRITICAL SEO INSTRUCTIONS:
- Generate a 50-60 character click-optimized \`seoTitle\`.
- Generate a 150-160 character snippet-optimized \`metaDescription\`.
- Generate exactly 5-7 high-volume \`keywords\` relevant to the article, comma separated.
- Throughout the article body, use rich, descriptive header tags (## and ###) that include long-tail search queries, instead of generic headers.

Use exactly this frontmatter structure (fill in the appropriate details based on your analysis):

---
title: "Your Catchy Headline Here"
summary: "A 1-2 sentence punchy summary of the article."
category: "[Choose exactly ONE category from the definitions above]"
author: "WhyThisBuzz Desk"
date: "${getFormattedDate()}"
readTime: "[Estimate, e.g., '3 min read']"
imageUrl: "${articleImage}"
seoTitle: "[Your 50-60 character SEO Title]"
metaDescription: "[Your 150-160 character Meta Description]"
keywords: "[comma, separated, list, of, keywords]"
---

Raw Scraped Text:
${articleText}
`;

      try {
        await new Promise(res => setTimeout(res, 2500));
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const result = await model.generateContent(prompt);
        let output = result.response.text();
        
        if (output.startsWith('```mdx')) output = output.replace(/^```mdx\n/, '');
        else if (output.startsWith('```markdown')) output = output.replace(/^```markdown\n/, '');
        else if (output.startsWith('```')) output = output.replace(/^```\n/, '');
        if (output.endsWith('```')) output = output.replace(/\n```$/, '');

        const frontmatterMatch = output.match(/---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
          console.error(`Could not parse frontmatter for ${region} article.`);
          continue;
        }

        const frontmatter = frontmatterMatch[1];
        let category = "World Affairs";
        const titleMatch = frontmatter.match(/title:\s*"(.*?)"/);
        const categoryMatch = frontmatter.match(/category:\s*"(.*?)"/);
        
        if (categoryMatch) category = categoryMatch[1];
        const articleTitle = titleMatch ? titleMatch[1] : selectedTrend;

        const date = new Date();
        const year = date.getFullYear().toString();
        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
        const monthName = monthFormatter.format(date);
        const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
        const monthFolder = `${monthNum}-${monthName}`;
        const yearWeek = getYearWeekString();
        
        const slug = slugify(articleTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        
        const validCategories = ["Sports", "Entertainment", "Technology", "World Affairs", "Movies", "Social-Media"];
        if (!validCategories.includes(category)) {
          category = "World Affairs";
        }

        const targetDir = path.join(process.cwd(), 'src', 'content', category, year, monthFolder, yearWeek);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, `${slug}.mdx`);
        fs.writeFileSync(filePath, output.trim());
        console.log(`Successfully saved local MDX at: ${filePath}`);

        // Push straight to Supabase if configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey) {
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseKey);
            
            const bodyContent = output.slice(frontmatterMatch[0].length).trim();
            const summaryMatch = frontmatter.match(/summary:\s*"(.*?)"/);
            const authorMatch = frontmatter.match(/author:\s*"(.*?)"/);
            const dateMatch = frontmatter.match(/date:\s*"(.*?)"/);
            const readTimeMatch = frontmatter.match(/readTime:\s*"(.*?)"/);
            const imageUrlMatch = frontmatter.match(/imageUrl:\s*"(.*?)"/);
            const seoTitleMatch = frontmatter.match(/seoTitle:\s*"(.*?)"/);
            const metaDescriptionMatch = frontmatter.match(/metaDescription:\s*"(.*?)"/);
            const keywordsMatch = frontmatter.match(/keywords:\s*"(.*?)"/);

            const { error: sbError } = await supabase.from('articles').upsert({
              slug,
              title: articleTitle,
              summary: summaryMatch ? summaryMatch[1] : '',
              content: bodyContent,
              category,
              author: authorMatch ? authorMatch[1] : 'WhyThisBuzz Desk',
              date: parseToISODate(dateMatch ? dateMatch[1] : undefined),
              read_time: readTimeMatch ? readTimeMatch[1] : '3 min read',
              image_url: imageUrlMatch ? imageUrlMatch[1] : articleImage,
              seo_title: seoTitleMatch ? seoTitleMatch[1] : undefined,
              meta_description: metaDescriptionMatch ? metaDescriptionMatch[1] : undefined,
              keywords: keywordsMatch ? keywordsMatch[1] : undefined,
            }, { onConflict: 'slug' });

            if (sbError) {
              console.error(`⚠️ Supabase upload error for ${slug}:`, sbError.message);
            } else {
              console.log(`🚀 Successfully published ${slug} to Supabase Database!`);
            }
          } catch (sbErr) {
            console.error(`⚠️ Failed to push to Supabase:`, sbErr);
          }
        }
        regionProcessed++;
      } catch (error) {
        console.error(`Failed to generate or save article for ${region}:`, error);
      }
    }
  }

  // Save updated history
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log("History saved successfully.");
}

main().catch(console.error);
