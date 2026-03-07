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

// Format date like "Jan 16, 2026"
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
    
    // Extract og:image or twitter:image
    const imageUrl = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') || 
                   '/images/placeholder.jpg';

    // Attempt to extract main article text
    let text = '';
    $('p').each((_, el) => {
      const paragraph = $(el).text().trim();
      if (paragraph.length > 50) {
        text += paragraph + '\n\n';
      }
    });

    return { text, imageUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { text: '', imageUrl: '/images/placeholder.jpg' };
  }
}

async function main() {
  const regions = ['US', 'GB', 'DE'];
  const historyPath = path.join(process.cwd(), 'scripts', 'history.json');
  
  // Load history to avoid duplicates
  let history: string[] = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch (_) {
      console.warn("Could not parse history.json, starting fresh.");
    }
  }

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

    let selectedTrend = null;
    let articleText = '';
    let articleImage = '/images/placeholder.jpg';

    for (const item of feed.items) {
      const title = item.title || 'Unknown';
      
      // Basic deduplication based on trend title
      const slugifiedTitle = slugify(title, { lower: true, strict: true });
      if (history.includes(slugifiedTitle)) {
        console.log(`Skipping already covered trend: ${title}`);
        continue;
      }

      if (!item.news_item || item.news_item.length === 0) continue;
      
      const newsLink = item.news_item[0]['ht:news_item_url'][0];
      console.log(`Analyzing trend: ${title} - fetching ${newsLink}`);
      
      const { text, imageUrl } = await scrapeArticleData(newsLink);
      if (text.length > 500) { // Require at least some decent length text
        selectedTrend = title;
        articleText = text;
        articleImage = imageUrl;
        history.push(slugifiedTitle); // Mark as processed
        break;
      } else {
        console.log(`Skipping link (text too short): ${newsLink}`);
      }
    }

    if (!selectedTrend || !articleText) {
      console.log(`Could not find a valid article to scrape for ${region}.`);
      continue;
    }

    console.log(`Selected trend for ${region}: ${selectedTrend}`);
    console.log(`Extracted image: ${articleImage}`);
    console.log(`Generating article with Gemini...`);

    const prompt = `
You are a top-tier journalist for a modern digital news site called "WhyThisBuzz".
Your writing style is engaging, punchy, clear, and analytical. You explain not just what happened, but *why* it matters.

I will provide you with the raw scraped text from a trending news article about "${selectedTrend}".
Your task is to re-write this article completely in your own words, adhering strictly to the "WhyThisBuzz" style.
Add a catchy title, a short summary, and use Markdown for formatting (headers, bold text, bullet points if needed).

Important formatting requirement:
The output MUST be a valid MDX file, starting immediately with frontmatter enclosed in '---', and then the article body.

Use exactly this frontmatter structure (fill in the appropriate details):

---
title: "Your Catchy Headline Here"
summary: "A 1-2 sentence punchy summary of the article."
category: "[Choose ONE of: Sports, Entertainment, Technology, World Affairs]"
author: "WhyThisBuzz Desk"
date: "${getFormattedDate()}"
readTime: "[Estimate, e.g., '3 min read']"
imageUrl: "${articleImage}"
---

Raw Scraped Text:
${articleText}
`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      let output = result.response.text();
      
      // Clean up potential markdown code block wrappers
      if (output.startsWith('\`\`\`mdx')) output = output.replace(/^\`\`\`mdx\n/, '');
      else if (output.startsWith('\`\`\`markdown')) output = output.replace(/^\`\`\`markdown\n/, '');
      else if (output.startsWith('\`\`\`')) output = output.replace(/^\`\`\`\n/, '');
      if (output.endsWith('\`\`\`')) output = output.replace(/\n\`\`\`$/, '');

      // Extract frontmatter to verify and get the category and title
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
      const title = titleMatch ? titleMatch[1] : selectedTrend;

      // Build the deep path like: src/content/Sports/2026/03-March/2026-W10/slug.mdx
      const date = new Date();
      const year = date.getFullYear().toString();
      const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
      const monthName = monthFormatter.format(date);
      const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthFolder = `${monthNum}-${monthName}`;
      const yearWeek = getYearWeekString();
      
      const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
      
      // Ensure "category" is one of the directories, fallback to "World Affairs" if invalid
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
      
      console.log(`Successfully published ${region} article at: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate or save article for ${region}:`, error);
    }
  }

  // Save updated history
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log("History saved successfully.");
}

main().catch(console.error);
