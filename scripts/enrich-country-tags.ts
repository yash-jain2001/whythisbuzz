import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Keywords strongly identifying United States context
const US_PATTERNS = [
  /\b(united states|usa|u\.s\.|american|white house|capitol hill|biden|trump|kamala|harris|vance|congress|senate|scotus|supreme court|fbi|cia|sec|nasa|ftc|faa|pentagon)\b/i,
  /\b(apple|iphone|ipad|macbook|google|microsoft|meta|openai|nvidia|tesla|spacex|amazon|netflix|disney|hollywood|oscars|emmys|grammys|billboard)\b/i,
  /\b(nfl|super bowl|nba|mlb|nhl|world series|lakers|celtics|warriors|yankees|dodgers|quarterback|touchdown|nascar)\b/i,
  /\b(wall street|federal reserve|fed rate|dow jones|s&p 500|nasdaq|treasury yields|california|florida|texas|new york|nyc|los angeles|chicago|washington)\b/i,
];

// Keywords strongly identifying United Kingdom context
const UK_PATTERNS = [
  /\b(united kingdom|britain|british|uk|england|scotland|wales|northern ireland|london|westminster|downing street|whitehall)\b/i,
  /\b(starmer|keir starmer|sunak|rishi sunak|tory|tories|labour party|parliament|mp|mps|house of commons|house of lords|chancellor|hmrc|nhs|bbc)\b/i,
  /\b(king charles|queen camilla|prince william|kate middleton|prince harry|royal family|buckingham palace|windsor)\b/i,
  /\b(premier league|epl|fa cup|arsenal|chelsea|liverpool|manchester united|man utd|manchester city|man city|tottenham|newcastle|aston villa|wimbledon|wembley)\b/i,
  /\b(bank of england|pound sterling|ftse|eurojackpot|oasis|liam gallagher|noel gallagher|rachel weisz|eurovision)\b/i,
];

// Keywords for Canada
const CA_PATTERNS = [
  /\b(canada|canadian|trudeau|justin trudeau|ottawa|ontario|quebec|toronto|vancouver|montreal|loblaws|sobeys|doug ford|nhl)\b/i,
];

// Keywords for Australia
const AU_PATTERNS = [
  /\b(australia|australian|sydney|melbourne|canberra|brisbane|afl|ashley barty|albanese|anthony albanese|logies|finder\.com\.au)\b/i,
];

// Keywords for India
const IN_PATTERNS = [
  /\b(india|indian|delhi|mumbai|bengaluru|bcci|ipl|modi|narendra modi|bollywood|filmfare|cricket team india)\b/i,
];

function detectCountry(title: string, summary: string, content: string): string | null {
  const text = `${title} ${title} ${summary} ${(content || '').slice(0, 1000)}`;

  // Test UK first (often specific)
  let ukScore = 0;
  for (const p of UK_PATTERNS) {
    const matches = text.match(p);
    if (matches) ukScore += matches.length;
  }

  // Test US
  let usScore = 0;
  for (const p of US_PATTERNS) {
    const matches = text.match(p);
    if (matches) usScore += matches.length;
  }

  // Test CA
  let caScore = 0;
  for (const p of CA_PATTERNS) {
    const matches = text.match(p);
    if (matches) caScore += matches.length;
  }

  // Test AU
  let auScore = 0;
  for (const p of AU_PATTERNS) {
    const matches = text.match(p);
    if (matches) auScore += matches.length;
  }

  // Test IN
  let inScore = 0;
  for (const p of IN_PATTERNS) {
    const matches = text.match(p);
    if (matches) inScore += matches.length;
  }

  const scores = [
    { code: 'GB', score: ukScore },
    { code: 'US', score: usScore },
    { code: 'CA', score: caScore },
    { code: 'AU', score: auScore },
    { code: 'IN', score: inScore },
  ];

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score > 0) {
    return scores[0].code;
  }

  return null;
}

async function enrichCountries() {
  console.log('🔄 Fetching all articles from Supabase to enrich country tags...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug, title, summary, content, country')
    .limit(1000);

  if (error || !articles) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Total articles fetched: ${articles.length}`);

  let updatedCount = 0;
  let usAssigned = 0;
  let ukAssigned = 0;
  let otherAssigned = 0;

  for (const article of articles) {
    // Only update if country is null or empty
    if (!article.country) {
      const detected = detectCountry(article.title || '', article.summary || '', article.content || '');
      if (detected) {
        const { error: updateErr } = await supabase
          .from('articles')
          .update({ country: detected })
          .eq('slug', article.slug);

        if (!updateErr) {
          updatedCount++;
          if (detected === 'US') usAssigned++;
          else if (detected === 'GB') ukAssigned++;
          else otherAssigned++;
        }
      } else {
        // Default general unassigned tech/pop culture to US if it's general English
        const lowerTitle = (article.title || '').toLowerCase();
        if (lowerTitle.includes('iphone') || lowerTitle.includes('apple') || lowerTitle.includes('ai') || lowerTitle.includes('tech') || lowerTitle.includes('movie')) {
          await supabase.from('articles').update({ country: 'US' }).eq('slug', article.slug);
          updatedCount++;
          usAssigned++;
        }
      }
    }
  }

  console.log(`\n🎉 Country Tag Enrichment Complete!`);
  console.log(`- Total articles updated: ${updatedCount}`);
  console.log(`- Tagged as US (United States): ${usAssigned}`);
  console.log(`- Tagged as GB (United Kingdom): ${ukAssigned}`);
  console.log(`- Tagged as other regions: ${otherAssigned}`);
}

enrichCountries().catch(console.error);
