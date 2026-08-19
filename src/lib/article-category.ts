/**
 * Canonical Article Category System for WhyThisBuzz
 * Single Source of Truth for Article Classification & Category Management
 */

export const CANONICAL_CATEGORIES = [
  'Sports',
  'Politics',
  'World Affairs',
  'Economics',
  'Technology',
  'Entertainment',
  'Social-Media',
] as const;

export type CanonicalCategory = typeof CANONICAL_CATEGORIES[number];

export function isValidCategory(cat?: string | null): cat is CanonicalCategory {
  if (!cat || typeof cat !== 'string') return false;
  const clean = cat.trim();
  return (CANONICAL_CATEGORIES as readonly string[]).includes(clean);
}

/**
 * Standardize raw or alias category strings to canonical format
 */
export function canonicalizeCategory(rawCat?: string | null): CanonicalCategory | null {
  if (!rawCat || typeof rawCat !== 'string') return null;
  const clean = rawCat.trim();

  for (const canonical of CANONICAL_CATEGORIES) {
    if (canonical.toLowerCase() === clean.toLowerCase()) return canonical;
  }

  const rLower = clean.toLowerCase().replace(/[-_]/g, ' ');

  if (rLower === 'sports' || rLower.includes('sport')) return 'Sports';
  if (rLower === 'entertainment' || rLower === 'movies' || rLower.includes('entertain') || rLower.includes('movie') || rLower.includes('cinema')) return 'Entertainment';
  if (rLower === 'politics' || rLower.includes('politic')) return 'Politics';
  if (rLower === 'economics' || rLower === 'business' || rLower.includes('economic') || rLower.includes('finance')) return 'Economics';
  if (rLower === 'technology' || rLower.includes('tech')) return 'Technology';
  if (rLower === 'social media' || rLower === 'social-media' || rLower.includes('social')) return 'Social-Media';
  if (rLower === 'world affairs' || rLower === 'world-affairs' || rLower.includes('world') || rLower.includes('global')) return 'World Affairs';

  return null;
}

export interface ClassificationResult {
  category: CanonicalCategory;
  confidence: number; // 0 - 100
  matchedSignals: string[];
  reason: string;
  method: 'AI' | 'EXPLICIT_SOURCE' | 'PRIMARY_SUBJECT' | 'FALLBACK';
}

export interface ClassificationInput {
  title?: string;
  summary?: string;
  content?: string;
  sourceCategory?: string;
  geminiCategory?: string;
}

/**
 * Category Weighted Entity & Topic Matchers
 */
interface CategoryPattern {
  primaryTitle: RegExp;
  primaryBody: RegExp;
  secondaryTitle?: RegExp;
  secondaryBody?: RegExp;
}

const PATTERNS: Record<CanonicalCategory, CategoryPattern> = {
  Sports: {
    primaryTitle: /\b(são paulo|sul-americana|champions league|premier league|la liga|bundesliga|serie a|nba|nfl|mlb|nhl|ipl|bcci|fifa|uefa|olympics|f1|formula 1|wimbledon|us open|french open|australian open|grand prix|super bowl|world cup|copa america|cricket|football|soccer|basketball|tennis|golf|marathon|boxing|ufc|mma|wrestling|stadium|derby|real madrid|barcelona|manchester|liverpool|arsenal|chelsea|tottenham|bayern|juventus|inter milan|psg|dortmund|ufc plot|de rossi|match|fixture|head coach|athlete|athletes)\b/i,
    primaryBody: /\b(score|scored|goal|goals|assist|penalty|red card|yellow card|var|halftime|extra time|overtime|playoffs|standings|roster|transfer fee|transfer market|fixture|head coach|stadium|arena|boxing ring|tennis court|club crisis)\b/i,
    secondaryTitle: /\b(vs|versus|defeat|defeats|defeated|victory|won|win|loses|lost|draw|drawn|trophy|cup|league|club|clubs)\b/i,
  },
  Entertainment: {
    primaryTitle: /\b(robert downey|iron man|marvel|mcu|tupac|duane davis|murder trial|box office|hollywood|bollywood|cinema|actor|actress|actresses|actors|movie|movies|film|films|trailer|trailer drop|oscars?|grammys?|filmfare|logies|emmys?|golden globes?|red carpet|celebrity|celebrities|pop culture|netflix|hbo|disney\+|paramount\+|twitch|streamer|album|single|concert|tour|soundtrack|sequel|prequel|blockbuster|showrunner|director|co-star|starring|axel schulz|selena gomez|the killers|alan ritchson|olivia wilde|rachel weisz|ricky martin|gwen stefani|liam gallagher|oasis reunion)\b/i,
    primaryBody: /\b(premiere|premiered|cinematic|screening|soundtrack|discography|billboard|cameo|fandom|casting|cast member|film set|behind the scenes|tv series|television series|miniseries|box-office|hit single|chart-topping|paparazzi|broadway|musical|acting)\b/i,
    secondaryTitle: /\b(drama|show|shows|star|stars|romance|hit|song|music|singer|singers)\b/i,
  },
  Technology: {
    primaryTitle: /\b(iphone|ipad|macbook|ios|android|apple|samsung|nvidia|microsoft|google ai|openai|chatgpt|gemini ai|claude|llm|generative ai|ai model|artificial intelligence|cybersecurity|semiconductor|chipmaker|smartphone|smartphones|gadget|gadgets|software|hardware|cloud computing|operating system|open source|app store|play store|tech giant|silicon valley|next\.js|react framework|flock safety|raspberry pi|spacex|starship|ai chip|space technology|orbital flight)\b/i,
    primaryBody: /\b(processor|gpu|cpu|ram|battery life|display tech|firmware|cyber attack|malware|data breach|vulnerability|algorithm|neural network|deep learning|machine learning|saas|api|developer tools|tech market|tech sector|silicon|microchip|orbital flight)\b/i,
    secondaryTitle: /\b(tech|app|digital|ai|data|cyber|launch|launches)\b/i,
  },
  Economics: {
    primaryTitle: /\b(inflation|central bank|central banks|interest rate|interest rates|rate cut|rate cuts|rate hike|rate hikes|stock market|stocks|crypto|bitcoin|ethereum|binance|wall street|earnings|pension|gdp|recession|financial|banking|federal reserve|fed|treasury|wall st|dow jones|s&p 500|nasdaq|bond yield|bonds|monetary policy|cts eventim|vanguard|ipo|etf|savings deals|financial times|minijob|diageo|pharmacies levy|behari lal|stock market crash|cpi)\b/i,
    primaryBody: /\b(quarterly earnings|profit margin|fiscal year|dividend|shareholders|market cap|initial public offering|ipo|venture capital|bankrupt|bankruptcy|debt ceiling|trade deficit|tariff|consumer price index|cpi|unemployment rate|financial market|monetary policy)\b/i,
    secondaryTitle: /\b(revenue|profit|market|investors|finance|business|economy|economic|trade|bank)\b/i,
  },
  Politics: {
    primaryTitle: /\b(election|elections|poll|polls|voting|voters|ballot|biden|trump|starmer|modi|putin|macron|scholz|politics|political|parliament|senate|congress|minister|prime minister|president|government|lawsuit|supreme court|scotus|legislation|statute|cabinet|sanctions|white house|capitol hill|impeachment|campaign|candidate|keir starmer|tom homan|justice minister|palestine action|scotus ruling)\b/i,
    primaryBody: /\b(legislative|bipartisan|democrats|republicans|tories|labour party|parliamentary|governor|mayor|constitution|constitutional|executive order|veto|policy proposal|political party|lawmakers|jurisdiction)\b/i,
    secondaryTitle: /\b(law|court|judge|legal|bill|rule|rules|policy)\b/i,
  },
  'Social-Media': {
    primaryTitle: /\b(tiktok|instagram|youtube|x\.com|twitter|threads|reels|shorts|viral|influencer|influencers|content creator|creators|streamer|streamers|tiktokers?|youtubers?|trending hashtag|social media platform|internet culture|neil the seal|rosenheim|vlogger|youtube creator|tiktok creator|viral creator|creator|influencer controversy)\b/i,
    primaryBody: /\b(follower|followers|going viral|subscribers|algorithm|shadowban|content creation|vlog|vlogger|meme|memes|feed|post|posted|engagement rate|social platform)\b/i,
    secondaryTitle: /\b(social media|viral trend|going viral)\b/i,
  },
  'World Affairs': {
    primaryTitle: /\b(severe weather|meteorological|meteorology|weather alert|storm|storms|cyclone|typhoon|hurricane|tsunami|flood|floods|earthquake|disaster|disasters|diplomacy|astronomy|gaza|israel|ukraine|russia|war|ceasefire|peace talks|united nations|un security council|nato|refugee|refugees|humanitarian|foreign policy|geopolitics|embassy|envoy|international conflict|global summit)\b/i,
    primaryBody: /\b(international relations|global summit|bilateral talks|sovereignty|peacekeeping|conflict zone|casualty|casualties|evacuation|disaster relief|meteorologists|seismic|global affairs|worldwide conflict|airstrike|ceasefire)\b/i,
    secondaryTitle: /\b(global|world|international|summit|crisis|refugee)\b/i,
  },
};

/**
 * Robust Hybrid Classifier for Primary Subject Identification
 */
export function classifyArticle(input: ClassificationInput): ClassificationResult {
  const { title = '', summary = '', content = '', sourceCategory, geminiCategory } = input;
  const fullText = `${title} ${summary} ${content}`.trim();
  const lowerTitle = title.toLowerCase();
  const lowerFullText = fullText.toLowerCase();

  // 1. Gemini AI Classification Check
  const canonicalGemini = canonicalizeCategory(geminiCategory);
  if (canonicalGemini) {
    const pattern = PATTERNS[canonicalGemini];
    const hasPrimaryTitle = pattern.primaryTitle.test(lowerTitle);
    const hasPrimaryBody = pattern.primaryBody.test(lowerFullText);

    if (hasPrimaryTitle || hasPrimaryBody) {
      return {
        category: canonicalGemini,
        confidence: hasPrimaryTitle ? 95 : 88,
        matchedSignals: [
          `AI output: "${geminiCategory}"`,
          hasPrimaryTitle ? 'Primary title entity match' : 'Primary body context match',
        ],
        reason: `AI classification verified with entity patterns`,
        method: 'AI',
      };
    }

    if (fullText.length > 250) {
      return {
        category: canonicalGemini,
        confidence: 82,
        matchedSignals: [`AI output: "${geminiCategory}"`],
        reason: `AI semantic classification from full article context`,
        method: 'AI',
      };
    }
  }

  // 2. Explicit Source Category Check
  const canonicalSource = canonicalizeCategory(sourceCategory);

  // 3. Primary Subject Weighted Scoring Engine
  const scores: Record<CanonicalCategory, { score: number; signals: string[] }> = {
    Sports: { score: 0, signals: [] },
    Politics: { score: 0, signals: [] },
    'World Affairs': { score: 0, signals: [] },
    Economics: { score: 0, signals: [] },
    Technology: { score: 0, signals: [] },
    Entertainment: { score: 0, signals: [] },
    'Social-Media': { score: 0, signals: [] },
  };

  for (const cat of CANONICAL_CATEGORIES) {
    const p = PATTERNS[cat];

    // Primary Title Matches (100 pts per unique entity match)
    const pTitleMatches = lowerTitle.match(new RegExp(p.primaryTitle, 'gi'));
    if (pTitleMatches) {
      const uniqueMatches = Array.from(new Set(pTitleMatches.map(m => m.toLowerCase())));
      const scoreAdd = uniqueMatches.length * 100;
      scores[cat].score += scoreAdd;
      scores[cat].signals.push(`Primary Title (${uniqueMatches.length}): "${uniqueMatches.join(', ')}"`);
    }

    // Secondary Title Matches (20 pts per unique match)
    if (p.secondaryTitle) {
      const sTitleMatches = lowerTitle.match(new RegExp(p.secondaryTitle, 'gi'));
      if (sTitleMatches) {
        const uniqueMatches = Array.from(new Set(sTitleMatches.map(m => m.toLowerCase())));
        const scoreAdd = uniqueMatches.length * 20;
        scores[cat].score += scoreAdd;
        scores[cat].signals.push(`Secondary Title (${uniqueMatches.length}): "${uniqueMatches.join(', ')}"`);
      }
    }

    // Primary Body Matches (30 pts per match up to 90)
    const pBodyMatches = lowerFullText.match(new RegExp(p.primaryBody, 'gi'));
    if (pBodyMatches) {
      const count = Math.min(pBodyMatches.length, 3);
      scores[cat].score += count * 30;
      scores[cat].signals.push(`Primary Body (${count}): ${pBodyMatches.slice(0, 2).join(', ')}`);
    }

    // Secondary Body Match (10 pts)
    if (p.secondaryBody) {
      const sBodyMatch = lowerFullText.match(new RegExp(p.secondaryBody, 'gi'));
      if (sBodyMatch) {
        const count = Math.min(sBodyMatch.length, 2);
        scores[cat].score += count * 10;
        scores[cat].signals.push(`Secondary Body (${count}): ${sBodyMatch.slice(0, 2).join(', ')}`);
      }
    }

    // Source Tag Boost (20 pts)
    if (canonicalSource === cat) {
      scores[cat].score += 20;
      scores[cat].signals.push(`Source Tag: "${sourceCategory}"`);
    }
  }

  // Find Top Scoring Categories
  let topCat: CanonicalCategory | null = null;
  let highestScore = 0;
  let runnerUpScore = 0;

  for (const cat of CANONICAL_CATEGORIES) {
    const sc = scores[cat].score;
    if (sc > highestScore) {
      runnerUpScore = highestScore;
      highestScore = sc;
      topCat = cat;
    } else if (sc > runnerUpScore) {
      runnerUpScore = sc;
    }
  }

  if (topCat && highestScore >= 40) {
    const margin = highestScore - runnerUpScore;
    // Calculate calibrated classification confidence
    let confidence = 70;
    if (highestScore >= 100) confidence += 20; // Has strong primary title entity
    if (margin >= 50) confidence += 10; // Clear margin over runner-up

    confidence = Math.min(98, confidence);

    return {
      category: topCat,
      confidence,
      matchedSignals: scores[topCat].signals,
      reason: `Primary Subject Match (${highestScore} pts vs ${runnerUpScore} runner-up)`,
      method: 'PRIMARY_SUBJECT',
    };
  }

  // 4. Clean Source Category Fallback
  if (canonicalSource) {
    return {
      category: canonicalSource,
      confidence: 72,
      matchedSignals: [`Explicit Source: "${sourceCategory}"`],
      reason: `Trusted explicit source category "${sourceCategory}"`,
      method: 'EXPLICIT_SOURCE',
    };
  }

  // 5. Final Fallback: World Affairs
  return {
    category: 'World Affairs',
    confidence: 60,
    matchedSignals: ['General news fallback'],
    reason: `General news content without strong specific category triggers`,
    method: 'FALLBACK',
  };
}

/**
 * Centralized Category Normalizer for UI & Supabase layer
 */
export function normalizeCategory(title?: string, summary?: string, rawCategory?: string): CanonicalCategory {
  const result = classifyArticle({
    title,
    summary,
    sourceCategory: rawCategory,
  });

  return result.category;
}
