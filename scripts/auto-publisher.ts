import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment variables.");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const parser = new Parser({
  customFields: {
    item: [
      ['ht:approx_traffic', 'approx_traffic'],
      ['ht:news_item', 'news_item', { keepArray: true }],
    ],
  }
});

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

    $('script, style, nav, footer, iframe, header, noscript, .ad, .advertisement').remove();

    let text = '';
    $('p').each((_, element) => {
      const pText = $(element).text().trim();
      if (pText.length > 50) {
        text += pText + '\n\n';
      }
    });

    let imageUrl = $('meta[property="og:image"]').attr('content') || 
                    $('meta[name="twitter:image"]').attr('content') || '';

    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = '';
    }

    return { text: text.trim(), imageUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { text: '', imageUrl: '' };
  }
}

async function generateWithRetry(prompt: string): Promise<string> {
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const modelName of models) {
      try {
        await new Promise(res => setTimeout(res, 2500));
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        lastError = err;
        const msg = err.message || String(err);
        if (msg.includes('429') || msg.includes('503') || msg.includes('quota')) {
          console.warn(`[Attempt ${attempt}/3] ${modelName} rate limited / busy. Waiting 10s...`);
          await new Promise(res => setTimeout(res, 10000));
        } else {
          console.warn(`[Attempt ${attempt}/3] ${modelName} failed: ${msg.substring(0, 100)}`);
        }
      }
    }
  }
  throw lastError;
}

async function getPublishedSlugs(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase.from('articles').select('slug');
    if (error || !data) return new Set();
    return new Set(data.map(item => item.slug));
  } catch {
    return new Set();
  }
}

async function main() {
  const regions = ['US', 'GB', 'DE'];
  const publishedSlugs = await getPublishedSlugs();
  console.log(`🌐 Supabase DB currently contains ${publishedSlugs.size} articles.`);

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

      if (publishedSlugs.has(slugifiedTitle)) {
        console.log(`Skipping already published trend: ${title}`);
        continue;
      }

      if (!item.news_item || item.news_item.length === 0) continue;
      
      const newsLink = item.news_item[0]['ht:news_item_url'][0];
      console.log(`Analyzing trend (${regionProcessed + 1}/${TARGET_PER_REGION} for ${region}): ${title} - fetching ${newsLink}`);
      
      let { text, imageUrl } = await scrapeArticleData(newsLink);
      if (text.length <= 150) {
        text = `Headline trend: ${title}. Provide a full in-depth news analysis explaining what happened, key background details, and why this matters to the public.`;
      }

      const defaultBrandThumbnail = "/images/default-thumbnail.png";

      const selectedTrend = title;
      const articleText = text;
      const articleImage = imageUrl || defaultBrandThumbnail;

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
- Include 4-8 targeted keywords as a comma-separated list in \`keywords\`.

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
        let output = await generateWithRetry(prompt);
        
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
        const slug = slugify(articleTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
        
        const validCategories = ["Sports", "Entertainment", "Technology", "World Affairs", "Movies", "Social-Media"];
        if (!validCategories.includes(category)) {
          category = "World Affairs";
        }

        const bodyContent = output.slice(frontmatterMatch[0].length).trim();
        const summaryMatch = frontmatter.match(/summary:\s*"(.*?)"/);
        const authorMatch = frontmatter.match(/author:\s*"(.*?)"/);
        const dateMatch = frontmatter.match(/date:\s*"(.*?)"/);
        const readTimeMatch = frontmatter.match(/readTime:\s*"(.*?)"/);
        const imageUrlMatch = frontmatter.match(/imageUrl:\s*"(.*?)"/);
        const seoTitleMatch = frontmatter.match(/seoTitle:\s*"(.*?)"/);
        const metaDescriptionMatch = frontmatter.match(/metaDescription:\s*"(.*?)"/);
        const keywordsMatch = frontmatter.match(/keywords:\s*"(.*?)"/);

        const parsedImg = imageUrlMatch ? imageUrlMatch[1] : '';
        const finalImage = (parsedImg && parsedImg.startsWith('http') && !parsedImg.includes('photo-1611162617474-5b21e879e113')) 
          ? parsedImg 
          : (imageUrl && imageUrl.startsWith('http') ? imageUrl : defaultBrandThumbnail);

        const { error: sbError } = await supabase.from('articles').upsert({
          slug,
          title: articleTitle,
          summary: summaryMatch ? summaryMatch[1] : '',
          content: bodyContent,
          category,
          author: authorMatch ? authorMatch[1] : 'WhyThisBuzz Desk',
          date: parseToISODate(dateMatch ? dateMatch[1] : undefined),
          read_time: readTimeMatch ? readTimeMatch[1] : '3 min read',
          image_url: finalImage,
          seo_title: seoTitleMatch ? seoTitleMatch[1] : undefined,
          meta_description: metaDescriptionMatch ? metaDescriptionMatch[1] : undefined,
          keywords: keywordsMatch ? keywordsMatch[1] : undefined,
        }, { onConflict: 'slug' });

        if (sbError) {
          console.error(`⚠️ Supabase upload error for ${slug}:`, sbError.message);
        } else {
          publishedSlugs.add(slugifiedTitle);
          publishedSlugs.add(slug);
          console.log(`🚀 Successfully published "${articleTitle}" (${slug}) directly to Supabase DB!`);
          regionProcessed++;
        }
      } catch (error) {
        console.error(`Failed to generate or save article for ${region}:`, error);
      }
    }
  }

  console.log("✅ All articles processed and saved directly to Supabase DB!");
}

main().catch(console.error);
