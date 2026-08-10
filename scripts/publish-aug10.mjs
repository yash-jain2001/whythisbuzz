import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newArticles = [
  {
    slug: 'apple-unveils-revolutionary-ai-features-and-next-gen-hardware-august-2026',
    title: 'Apple Unveils Revolutionary AI Features & Next-Gen Hardware in August Event',
    summary: 'Apple has officially announced groundbreaking AI integrations across its ecosystem, setting new standards for mobile and desktop computing.',
    content: `# Apple Unveils Revolutionary AI Features & Next-Gen Hardware

Apple has officially unveiled its latest lineup of hardware and software innovations, featuring deep AI integration across iOS, iPadOS, and macOS.

## Key Highlights

- **On-Device Intelligence:** Enhanced privacy-first AI models running locally on M-series and A-series chips.
- **Next-Gen Hardware:** Sleeker designs with upgraded display technology and battery performance.
- **Developer Ecosystem:** New APIs empowering developers to harness high-speed neural processing.

Stay tuned as we bring you full hands-on reviews and deep-dive comparisons.`,
    category: 'Technology',
    author: 'WhyThisBuzz Tech Desk',
    date: 'Aug 10, 2026',
    read_time: '4 min read',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
    seo_title: 'Apple AI Event August 2026: Everything Announced',
    meta_description: 'Discover Apple\'s newest AI capabilities and hardware announcements from the August 2026 event.',
    keywords: 'Apple, AI, Technology, iPhone, Mac, Tech News'
  },
  {
    slug: 'champions-league-2026-blockbuster-draw-and-matchday-1-breakdown',
    title: 'Champions League 2026: Blockbuster Draw & Matchday 1 Deep Dive',
    summary: 'Europe\'s elite clubs learn their fate as the Champions League 2026/27 group stage draw promises thrilling high-stakes clashes.',
    content: `# Champions League 2026: Blockbuster Draw & Matchday 1 Deep Dive

The UEFA Champions League returns with high drama as the group stage draw sets up heavyweight matchups across Europe.

## What to Watch For

1. **Titans Collide:** Real Madrid, Manchester City, and Bayern Munich face daunting early fixtures.
2. **Rising Underdogs:** Dark horse contenders look to shock established giants in the group stage.
3. **Key Players:** World-class talents aim to carry their squads to European glory.

Football fans around the world are gearing up for an unforgettable European campaign.`,
    category: 'Sports',
    author: 'WhyThisBuzz Sports Desk',
    date: 'Aug 10, 2026',
    read_time: '3 min read',
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200',
    seo_title: 'Champions League 2026 Draw: Group Stage Analysis',
    meta_description: 'Full analysis of the UEFA Champions League 2026 draw and upcoming Matchday 1 fixtures.',
    keywords: 'Champions League, Football, UEFA, Sports News, Soccer'
  },
  {
    slug: 'global-economic-summit-2026-key-takeaways-on-trade-and-sustainability',
    title: 'Global Economic Summit 2026: Key Takeaways on Trade, Inflation & Sustainability',
    summary: 'World leaders and financial experts gather to establish new global accords aimed at stabilizing markets and driving green initiatives.',
    content: `# Global Economic Summit 2026: Key Takeaways

World leaders, central bankers, and policy experts gathered at the 2026 Global Economic Summit to tackle persistent inflation and international supply chain resilience.

## Core Accords Agreed Upon

- **Green Energy Transition:** Accelerated investment commitments for renewable power grids.
- **Trade Frameworks:** Streamlined international trade protocols to boost global economic growth.
- **Digital Economy:** Enhanced regulations governing cross-border digital commerce.

Experts express optimism that these policy frameworks will pave the way for steady market stability.`,
    category: 'World Affairs',
    author: 'WhyThisBuzz Global Desk',
    date: 'Aug 10, 2026',
    read_time: '5 min read',
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200',
    seo_title: 'Global Economic Summit 2026: World News & Analysis',
    meta_description: 'Comprehensive coverage of key policy decisions from the 2026 Global Economic Summit.',
    keywords: 'Global Economy, World News, Summit 2026, Trade, Markets'
  },
  {
    slug: 'summer-blockbuster-shatters-box-office-records-august-2026',
    title: 'Summer Blockbuster Shatters Box Office Records with Historic Opening Weekend',
    summary: 'The year\'s most anticipated cinematic spectacle outperforms expectations, reigniting excitement across global movie theaters.',
    content: `# Summer Blockbuster Shatters Box Office Records

Cinemas worldwide enjoyed massive turnouts as the latest summer release smashed opening weekend records across global box offices.

## Why Audiences Are Loving It

- **Stunning Visual Effects:** Groundbreaking cinematography and practical stunts elevate the movie experience.
- **Star-Studded Cast:** Critical praise for lead performances and compelling narrative arcs.
- **Word-of-Mouth Hype:** Viral social media discussions driving sold-out theater screenings.

Industry analysts predict the film will continue its dominant run heading into autumn.`,
    category: 'Movies',
    author: 'WhyThisBuzz Cinema Desk',
    date: 'Aug 10, 2026',
    read_time: '4 min read',
    image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    seo_title: 'Box Office Records Smashed: August 2026 Movie Buzz',
    meta_description: 'Read how the latest summer blockbuster surpassed expectations and broke international box office records.',
    keywords: 'Movies, Box Office, Cinema, Hollywood, Entertainment'
  },
  {
    slug: 'viral-creator-trends-shaping-digital-culture-in-august-2026',
    title: 'Viral Creator Trends Shaping Digital Culture & Social Media in August 2026',
    summary: 'From AI-assisted short-form content to decentralized community platforms, explore the latest trends sweeping social networks.',
    content: `# Viral Creator Trends Shaping Digital Culture in August 2026

Social media landscapes continue to evolve rapidly as creators embrace new tools and format styles to engage audiences worldwide.

## Key Trends

1. **Interactive Storytelling:** Audiences actively participate in shaping creator content storylines.
2. **Authenticity Over Polish:** Micro-vlogs and raw, unedited moments dominate feed algorithms.
3. **Decentralized Hubs:** Niche creator communities flourish on dedicated private platforms.

Discover how these cultural shifts are redefining digital media consumption.`,
    category: 'Social Media',
    author: 'WhyThisBuzz Social Desk',
    date: 'Aug 10, 2026',
    read_time: '3 min read',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
    seo_title: 'Social Media Trends August 2026: Digital Culture Explained',
    meta_description: 'An overview of the biggest viral trends and creator shifts transforming social media in August 2026.',
    keywords: 'Social Media, Viral Trends, Digital Culture, Creators'
  }
];

async function publishAug10() {
  console.log('🚀 Publishing August 10, 2026 articles to Supabase...');
  for (const article of newArticles) {
    const { error } = await supabase.from('articles').upsert(article, { onConflict: 'slug' });
    if (error) {
      console.error(`❌ Failed to publish ${article.slug}:`, error.message);
    } else {
      console.log(`✅ Successfully published: ${article.title} (${article.date})`);
    }
  }
  console.log('🎉 Done! August 10th articles are live in Supabase!');
}

publishAug10();
