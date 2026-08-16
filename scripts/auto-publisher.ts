import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { TwitterApi } from 'twitter-api-v2';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { execSync } from 'child_process';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { getCountryForArticle } from '../src/lib/country-utils';

dotenv.config();

async function postToTwitter(title: string, summary: string, slug: string) {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    console.log(`ℹ️ Twitter API keys not fully configured. Skipping tweet for "${title}".`);
    return;
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });

    const articleUrl = `https://whythisbuzz.com/article/${slug}`;
    const cleanSummary = summary.length > 120 ? summary.substring(0, 117) + '...' : summary;
    const tweetText = `⚡ ${title}\n\n${cleanSummary}\n\nRead full story ⤵️\n${articleUrl}`;

    const tweet = await client.v2.tweet(tweetText);
    console.log(`🐦 Successfully posted automated tweet on X for "${title}" (ID: ${tweet.data.id})`);
  } catch (err: any) {
    console.error(`⚠️ Failed to post tweet for "${title}":`, err?.message || err);
  }
}

async function sendOneSignalPushNotification(title: string, summary: string, slug: string, imageUrl: string) {
  const appId = "fd795284-7bb7-48af-b19e-284270c5168e";
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!restApiKey) {
    console.log(`ℹ️ ONESIGNAL_REST_API_KEY not configured in .env. Push notification ready for App ID: ${appId}`);
    return;
  }

  try {
    const articleUrl = `https://whythisbuzz.com/article/${slug}`;
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${restApiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["All"],
        headings: { en: `⚡ Breaking: ${title}` },
        contents: { en: summary },
        url: articleUrl,
        chrome_web_image: imageUrl,
        big_picture: imageUrl,
      }),
    });

    const data = await response.json();
    console.log(`🔔 OneSignal Web Push notification sent for "${title}":`, data);
  } catch (err: any) {
    console.error(`⚠️ Failed to send OneSignal push for "${title}":`, err?.message || err);
  }
}

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

const CATEGORY_FALLBACK_IMAGES: Record<string, string[]> = {
  Sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80",
  ],
  Entertainment: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
  ],
  Movies: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
  ],
  Technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
  ],
  "Social-Media": [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80",
  ],
  "World Affairs": [
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  ],
  Politics: [
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1200&q=80",
  ],
  Economics: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
  ],
};

async function scrapeArticleData(url: string, preferredImage?: string): Promise<{ text: string; imageUrl: string }> {
  try {
    const isGooglePlaceholder = (urlStr: string) => {
      const lower = urlStr.toLowerCase();
      return lower.includes('googleusercontent.com') ||
             lower.includes('gstatic.com') ||
             lower.includes('google.com/news') ||
             lower.includes('news.google.com') ||
             lower.includes('placeholder') ||
             lower.includes('default-logo') ||
             lower.includes('favicon');
    };

    let imageUrl = '';
    if (preferredImage && preferredImage.startsWith('http') && !isGooglePlaceholder(preferredImage)) {
      imageUrl = preferredImage;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
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

    if (!imageUrl) {
      imageUrl = $('meta[property="og:image:secure_url"]').attr('content') ||
                 $('meta[property="og:image"]').attr('content') || 
                 $('meta[name="twitter:image:src"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 $('meta[name="image"]').attr('content') ||
                 $('link[rel="image_src"]').attr('href') || '';
    }

    if (imageUrl && isGooglePlaceholder(imageUrl)) {
      imageUrl = '';
    }

    if (!imageUrl) {
      $('article img, main img, .content img, p img, img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && src.startsWith('http') && !isGooglePlaceholder(src)) {
          const width = parseInt($(el).attr('width') || '0', 10);
          if (!imageUrl && (width > 200 || !width)) {
            imageUrl = src;
          }
        }
      });
    }

    if (imageUrl && (!imageUrl.startsWith('http') || isGooglePlaceholder(imageUrl))) {
      imageUrl = '';
    }

    // Ensure image query params target HD 1200px width for Google Discover eligibility
    if (imageUrl) {
      imageUrl = imageUrl.replace(/([?&])(w|width|resize|quality)=\d+/gi, (match, p1, p2) => {
        if (p2.toLowerCase() === 'w' || p2.toLowerCase() === 'width') return `${p1}${p2}=1200`;
        return match;
      });
    }

    return { text: text.trim(), imageUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { text: '', imageUrl: preferredImage || '' };
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

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string | null> {
  try {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const claimSet = Buffer.from(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })).toString('base64url');

    const signatureInput = `${header}.${claimSet}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(privateKey.replace(/\\n/g, '\n'), 'base64url');
    const jwt = `${signatureInput}.${signature}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const tokenData = await tokenRes.json();
    return tokenData.access_token || null;
  } catch (error) {
    console.warn('[Google Indexing API] Auth token error:', error);
    return null;
  }
}

async function pingGoogleIndexingApi(articleSlug: string): Promise<void> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  const articleUrl = `https://whythisbuzz.com/article/${articleSlug}`;

  if (!email || !privateKey) {
    console.log(`ℹ️ [Google Indexing API] GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY not configured. Skipping Google Indexing API ping.`);
    return;
  }

  try {
    const accessToken = await getGoogleAccessToken(email, privateKey);
    if (!accessToken) {
      console.warn(`[Google Indexing API] Failed to acquire OAuth access token for ${articleUrl}`);
      return;
    }

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url: articleUrl,
        type: 'URL_UPDATED'
      })
    });

    if (res.ok || res.status === 200) {
      console.log(`⚡ [Google Indexing API] Instant indexing ping sent for ${articleUrl}`);
    } else {
      const errText = await res.text();
      console.warn(`[Google Indexing API] HTTP ${res.status} response for ${articleUrl}:`, errText);
    }
  } catch (err) {
    console.error(`[Google Indexing API] Failed to ping for ${articleUrl}:`, err);
  }
}

async function pingIndexNow(articleSlug: string): Promise<void> {
  const host = 'whythisbuzz.com';
  const key = '9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c';
  const articleUrl = `https://${host}/article/${articleSlug}`;

  try {
    const payload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: [articleUrl]
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`⚡ [IndexNow] Instant indexing ping sent for ${articleUrl}`);
    } else {
      console.warn(`[IndexNow] Ping returned HTTP ${res.status} for ${articleUrl}`);
    }
  } catch (err) {
    console.error(`[IndexNow] Failed to ping for ${articleUrl}:`, err);
  }
}

function parseTraffic(trafficStr?: string): number {
  if (!trafficStr) return 10000;
  const cleaned = String(trafficStr).replace(/[^0-9]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 10000 : val;
}

async function main() {
  const regions = [
    'US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'KR', 'BR'
  ];
  const publishedSlugs = await getPublishedSlugs();
  console.log(`🌐 Supabase DB currently contains ${publishedSlugs.size} articles.`);

  // 60 Articles/Day Strategy: 15 articles per run x 4 runs/day (every 6 hours)
  const TOTAL_TARGET = 15;
  const MAX_PER_REGION = 3;

  console.log(`📡 [60 Articles/Day Strategy] Fetching Google Trends from 10 major global markets (Target: 15 top trends/run)...`);

  interface TrendCandidate {
    title: string;
    slug: string;
    region: string;
    traffic: number;
    newsLink: string;
    assignedCategory: string;
    trendImage?: string;
  }

  const CORE_CATEGORIES = [
    "Sports",
    "Entertainment",
    "Technology",
    "Social-Media",
    "Politics",
    "Economics",
    "World Affairs"
  ];

  function detectCategory(title: string): string {
    const text = title.toLowerCase();
    
    // 1. Economics (Inflation, Central Banks, Rates, Markets)
    if (/\b(inflation|central bank|central banks|interest rate|interest rates|rate cut|rate cuts|stock|stocks|market|markets|fed|federal reserve|banking|finance|economic|economy|crypto|bitcoin|binance|wall street|earnings|pension)\b/i.test(text)) {
      return "Economics";
    }
    // 2. Entertainment & Movies (Actors, Movies, Logies, Shows)
    if (/\b(acting|actor|actress|deborah mailman|logies|movie|movies|film|films|cinema|hollywood|bollywood|trailer|episode|season|show|shows|music|singer|singers|concert|oscar|oscars|grammy|filmfare|vimal|elaichi|surrogate|celebrity|celebrities|box office|netflix|hbo|disney|paramount)\b/i.test(text)) {
      return "Entertainment";
    }
    // 3. World Affairs / Weather & Disasters
    if (/\b(severe weather|meteorological|meteorology|weather alert|weather alerts|storm|storms|cyclone|typhoon|hurricane|tsunami|flood|floods|earthquake|disaster|disasters|diplomacy|astronomy|isha prayer|namaz|ramadan)\b/i.test(text)) {
      return "World Affairs";
    }
    // 4. Politics
    if (/\b(election|elections|biden|trump|starmer|politic|politics|political|parliament|senate|congress|minister|president|government|lawsuit|supreme court|modi|putin)\b/i.test(text)) {
      return "Politics";
    }
    // 5. Technology
    if (/\b(ai|artificial intelligence|software|cyber|semiconductor|chipmaker|smartphone|hardware|developer|cloud computing|operating system|open source)\b/i.test(text)) {
      return "Technology";
    }
    // 6. Social Media
    if (/\b(tiktok|instagram|youtube|x\.com|viral|influencer|streamer|creator)\b/i.test(text)) {
      return "Social-Media";
    }
    // 7. Sports (Strict word boundaries for vs, match, player, etc.)
    if (/\b(vs|versus|cricket|football|soccer|basketball|nba|nfl|ipl|bcci|fifa|uefa|olympics|f1|formula 1|wimbledon|tennis|golf|marathon|stadium|championship|tournament|league|bayern|tottenham|arsenal|chelsea|real madrid|barcelona)\b/i.test(text)) {
      return "Sports";
    }
    return "World Affairs";
  }

  const categoryTopicFeeds: Record<string, string> = {
    "Politics": "https://news.google.com/rss/search?q=politics+election+government+president&hl=en-US&gl=US&ceid=US:en",
    "Economics": "https://news.google.com/rss/search?q=economy+inflation+stock+markets+bank&hl=en-US&gl=US&ceid=US:en",
    "Technology": "https://news.google.com/rss/search?q=technology+ai+software+cyber+apple&hl=en-US&gl=US&ceid=US:en",
    "Sports": "https://news.google.com/rss/search?q=sports+match+championship+league&hl=en-US&gl=US&ceid=US:en",
    "Entertainment": "https://news.google.com/rss/search?q=entertainment+movies+celebrity+hollywood&hl=en-US&gl=US&ceid=US:en",
    "Social-Media": "https://news.google.com/rss/search?q=viral+tiktok+instagram+youtube+creator&hl=en-US&gl=US&ceid=US:en",
    "World Affairs": "https://news.google.com/rss/search?q=world+news+international+diplomacy&hl=en-US&gl=US&ceid=US:en",
  };

  const candidates: TrendCandidate[] = [];
  const seenSlugsInRun = new Set<string>();

  for (const region of regions) {
    try {
      const feed = await parser.parseURL(`https://trends.google.com/trending/rss?geo=${region}`);
      if (!feed.items || feed.items.length === 0) continue;

      for (const item of feed.items) {
        const title = item.title || '';
        if (!title) continue;
        const slugifiedTitle = slugify(title, { lower: true, strict: true });

        if (publishedSlugs.has(slugifiedTitle) || seenSlugsInRun.has(slugifiedTitle)) continue;
        if (!item.news_item || item.news_item.length === 0) continue;

        const newsItem = item.news_item[0];
        const newsLink = newsItem['ht:news_item_url']?.[0];
        if (!newsLink) continue;
        const trendImage = newsItem['ht:news_item_picture']?.[0] || '';

        const trafficStr = (item as any).approx_traffic || '';
        const traffic = parseTraffic(trafficStr);
        const assignedCategory = detectCategory(title);

        seenSlugsInRun.add(slugifiedTitle);
        candidates.push({
          title,
          slug: slugifiedTitle,
          region,
          traffic,
          newsLink,
          assignedCategory,
          trendImage,
        });
      }
    } catch (err: any) {
      console.warn(`Could not fetch RSS feed for ${region}:`, err?.message || err);
    }
  }

  console.log(`🔍 Total unique candidate trends collected globally: ${candidates.length}`);

  // Pure Category-Driven Strategy: Select top trending topics per category without regional caps
  const selectedTrends: TrendCandidate[] = [];
  const TARGET_PER_CATEGORY = 2;

  for (const cat of CORE_CATEGORIES) {
    const catCandidates = candidates.filter(c => c.assignedCategory === cat).sort((a, b) => b.traffic - a.traffic);
    const selectedForCat: TrendCandidate[] = catCandidates.slice(0, TARGET_PER_CATEGORY);

    // If Google Trends didn't yield 2 items for this category, fetch Google News Topic RSS Feed for this category!
    if (selectedForCat.length < TARGET_PER_CATEGORY && categoryTopicFeeds[cat]) {
      try {
        const feed = await parser.parseURL(categoryTopicFeeds[cat]);
        if (feed.items) {
          for (const item of feed.items) {
            if (selectedForCat.length >= TARGET_PER_CATEGORY) break;
            const title = item.title || '';
            if (!title) continue;
            const slugifiedTitle = slugify(title, { lower: true, strict: true });
            if (publishedSlugs.has(slugifiedTitle) || seenSlugsInRun.has(slugifiedTitle)) continue;
            const link = item.link || '';
            if (!link) continue;

            seenSlugsInRun.add(slugifiedTitle);
            const candidateObj: TrendCandidate = {
              title,
              slug: slugifiedTitle,
              region: 'US',
              traffic: 50000,
              newsLink: link,
              assignedCategory: cat,
            };
            selectedForCat.push(candidateObj);
          }
        }
      } catch (err: any) {
        console.warn(`Could not fetch topic feed for ${cat}:`, err?.message || err);
      }
    }

    selectedTrends.push(...selectedForCat);
  }

  // Fill up to 15 if needed from remaining top global trends sorted strictly by traffic
  if (selectedTrends.length < TOTAL_TARGET) {
    const selectedSlugs = new Set(selectedTrends.map(s => s.slug));
    const remaining = candidates
      .filter(c => !selectedSlugs.has(c.slug))
      .sort((a, b) => b.traffic - a.traffic);

    for (const cand of remaining) {
      if (selectedTrends.length >= TOTAL_TARGET) break;
      selectedTrends.push(cand);
    }
  }

  console.log(`🚀 [Category-Driven Publisher] Selected Top ${selectedTrends.length} Global Trends across all 7 Categories:`);
  selectedTrends.forEach((t, i) => console.log(` ${i + 1}. [${t.assignedCategory}] [${t.region}] ${t.title} (${t.traffic.toLocaleString()} searches) ${t.trendImage ? '🖼️ [Has Image]' : '⚠️ [No Image]'}`));

  let processedCount = 0;
  let noImageCount = 0;
  const MAX_NO_IMAGE_CAP = Math.floor(TOTAL_TARGET * 0.25); // Max 25% fallback limit (at most 3 articles without images)

  for (const trend of selectedTrends) {
    const { title, region, newsLink } = trend;
    
    const { text: scrapedText, imageUrl } = await scrapeArticleData(newsLink);
    const candidateImage = imageUrl || trend.trendImage || '';
    const hasOriginImage = Boolean(candidateImage && candidateImage.startsWith('http'));

    if (!hasOriginImage && noImageCount >= MAX_NO_IMAGE_CAP) {
      console.log(`⚠️ [Quality Control] Skipping trend "${title}" (No origin image and max 25% no-image cap reached).`);
      continue;
    }

    if (!hasOriginImage) {
      noImageCount++;
    }

    processedCount++;
    console.log(`\n--- Processing Trend (${processedCount}/${TOTAL_TARGET}) [${region}]: "${title}" ---`);
    console.log(`Fetching news source: ${newsLink}`);
    
    let text = scrapedText;
    if (text.length <= 150) {
      text = `Headline trend: ${title}. Provide a full in-depth news analysis explaining what happened, key background details, and why this matters to the public.`;
    }

    const defaultBrandThumbnail = "/images/default-thumbnail.png";
    const selectedTrend = title;
    const articleText = text;
    const articleImage = imageUrl || defaultBrandThumbnail;

    console.log(`Generating article with Gemini...`);

    const prompt = `
You are a top-tier journalist and Chief Editor for a modern digital news site called "WhyThisBuzz".
Your writing style is highly engaging, clear, analytical, and optimized for **Google Discover feeds**.

I will provide you with the raw scraped text from a trending news article about "${selectedTrend}".
Your task is to re-write this article completely in your own words, adhering strictly to the "WhyThisBuzz" style.

CRITICAL GOOGLE DISCOVER HEADLINE FORMULAS:
Create a magnetic, high-CTR headline (50-70 characters) tailored for Google Discover recommendations.
Must use one of these proven Google Discover curiosity-gap formulas:
- "Why [Subject] is [Action/Trend] Right Now"
- "The Real Reason Behind [News Event]"
- "Inside [Topic/Event]: What You Need to Know"
- "What [Event] Means for [Industry/Public]"
- "How [Entity] Unexpectedly [Development]"

CRITICAL DISCOVER SUMMARY FORMULA:
Craft a punchy 1-2 sentence summary that hooks mobile readers immediately on Discover feeds.

Important formatting requirement:
The output MUST be a valid MDX file, starting immediately with frontmatter enclosed in '---', and then the article body.

You must categorize this article into exactly ONE of the following valid categories:
- "Sports": If the article is about athletes, games, teams, drafts, or matches.
- "Entertainment": If the article concerns celebrities, musicians, TV shows, or pop culture.
- "Movies": If the article specifically focuses on a film, box office, actors in a film role, or cinema news.
- "Technology": If the article is about gadgets, software, AI, companies like Apple/Google, or scientific breakthroughs.
- "Social-Media": If the article revolves around platforms like TikTok, X (Twitter), Instagram, influencers, or viral trends.
- "Politics": If the article is about elections, government policies, leaders, legislation, diplomacy, or political events.
- "Economics": If the article is about stock markets, inflation, business, central banks, trade, or economic trends.
- "World Affairs": If the article is about international news, major events, crime, or general world events not fitting the others.

CRITICAL SEO INSTRUCTIONS:
- Generate a 50-60 character click-optimized \`seoTitle\`.
- Generate a 150-160 character snippet-optimized \`metaDescription\`.
- Include 4-8 targeted keywords as a comma-separated list in \`keywords\`.

Use exactly this frontmatter structure (fill in the appropriate details based on your analysis):

---
title: "Your Catchy Google Discover Headline Here"
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
      const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?\s*$/m);
      const categoryMatch = frontmatter.match(/category:\s*["']?([A-Za-z0-9\s-]+)["']?/m);
      
      if (categoryMatch) category = categoryMatch[1].trim();
      const articleTitle = titleMatch ? titleMatch[1].trim() : selectedTrend;
      const slug = slugify(articleTitle, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
      
      const bodyContent = output.slice(frontmatterMatch[0].length).trim();
      const summaryMatch = frontmatter.match(/summary:\s*"(.*?)"/);
      const authorMatch = frontmatter.match(/author:\s*"(.*?)"/);
      const dateMatch = frontmatter.match(/date:\s*"(.*?)"/);
      const readTimeMatch = frontmatter.match(/readTime:\s*"(.*?)"/);
      const imageUrlMatch = frontmatter.match(/imageUrl:\s*"(.*?)"/);
      const seoTitleMatch = frontmatter.match(/seoTitle:\s*"(.*?)"/);
      const metaDescriptionMatch = frontmatter.match(/metaDescription:\s*"(.*?)"/);
      const keywordsMatch = frontmatter.match(/keywords:\s*"(.*?)"/);

      const validCategories = ["Sports", "Entertainment", "Technology", "World Affairs", "Movies", "Social-Media", "Politics", "Economics"];
      
      // Strictly assign the category directly from the origin trend source
      category = trend.assignedCategory || category || 'World Affairs';

      const parsedImg = imageUrlMatch ? imageUrlMatch[1] : '';
      const finalImage = (parsedImg && parsedImg.startsWith('http')) 
        ? parsedImg 
        : (imageUrl && imageUrl.startsWith('http') ? imageUrl : '/images/placeholder.svg');

      const detectedCountryObj = getCountryForArticle(trend.region);
      const finalCountryCode = detectedCountryObj.code;

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
        country: finalCountryCode,
      }, { onConflict: 'slug' });

      if (sbError) {
        console.error(`⚠️ Supabase upload error for ${slug}:`, sbError.message);
      } else {
        publishedSlugs.add(trend.slug);
        publishedSlugs.add(slug);
        console.log(`🚀 Successfully published "${articleTitle}" (${slug}) directly to Supabase DB!`);

        await postToTwitter(articleTitle, summaryMatch ? summaryMatch[1] : '', slug);

        const pushImage = Array.isArray(finalImage) ? finalImage[0] : finalImage;
        await sendOneSignalPushNotification(articleTitle, summaryMatch ? summaryMatch[1] : '', slug, pushImage);

        await pingIndexNow(slug);

        await pingGoogleIndexingApi(slug);
      }
    } catch (error) {
      console.error(`Error generating article for ${region} trend "${selectedTrend}":`, error);
    }
  }

  console.log("✅ All articles processed and saved directly to Supabase DB!");
  try {
    console.log("🔄 Updating public/search-data.json...");
    execSync('node scripts/generate-search-data.mjs', { stdio: 'inherit' });
  } catch (err) {
    console.warn("⚠️ Failed to update search-data.json automatically:", err);
  }
}

main().catch(console.error);
