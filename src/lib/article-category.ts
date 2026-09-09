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
    primaryTitle: /\b(são paulo fc|sul-americana|champions league|premier league|la liga|bundesliga|serie a|nba|nfl|mlb|nhl|ipl|bcci|fifa|uefa|olympics|f1|formula 1|wimbledon|us open|french open|australian open|grand prix|super bowl|world cup|copa america|cricket|football|soccer|basketball|baseball|hockey|tennis|golf|marathon|boxing match|boxing title|boxing champion|boxing ring|pro boxing|heavyweight boxing|boxing bout|ufc|mma|wrestling|derby match|real madrid|barcelona fc|fc barcelona|manchester united|manchester city|man utd|man city|liverpool fc|arsenal fc|arsenal match|arsenal game|arsenal victory|arsenal squad|arsenal player|arsenal boss|arsenal manager|chelsea fc|tottenham|bayern munich|juventus|inter milan|psg|borussia dortmund|dortmund fc|lakers|celtics|warriors|yankees|dodgers|quarterback|pitcher|midfielder|goalkeeper|playoff|playoffs|sports tournament|match fixture|athlete|athletes|horse racing|auto racing|f1 racing|car racing|motor racing|nascar|snooker|judd trump|kia tigers|border war|leagues cup|ucl final|round of 16|pga tour|korn ferry tour|dp world tour|tour championship|cycling tour|tour de france|atp tour|wta tour|lpga tour|nwsl|nwsl showdown|nwsl match|lionel messi|messi|ronaldo|cristiano ronaldo|mbappé|mbappe)\b/i,
    secondaryTitle: /\b(vs|versus|defeat|defeats|defeated|victory|won match|loses match|lost match|draw match|drawn match|trophy cup|sports league|sports club|trade deadline|traded player|match score|final score|game score|league standings)\b/i,
    primaryBody: /\b(scored a goal|scored a point|assist|penalty kick|red card|yellow card|var review|halftime|extra time|overtime|playoffs|standings|roster|transfer fee|transfer market|match fixture|head coach|sports stadium|arena|boxing ring|tennis court|club crisis)\b/i,
    secondaryBody: /\b(match score|scored goal|scored goals|point scored)\b/i,
  },
  Entertainment: {
    primaryTitle: /\b(robert downey|iron man|marvel|mcu|tupac|duane davis|murder trial|box office|hollywood|bollywood|cinema|actor|actress|actresses|actors|movie|movies|film|films|movie trailer|film trailer|oscars?|grammys?|filmfare|logies|emmys?|golden globes?|red carpet|celebrity|celebrities|pop culture|netflix|hbo|disney\+|paramount\+|album release|hit single|music single|debut single|chart-topping single|concert tour|music tour|world tour|stadium show|stadium tour|stadium concert|soundtrack|movie sequel|movie prequel|blockbuster movie|blockbuster film|blockbuster series|blockbuster cinema|showrunner|film director|co-star|starring|axel schulz|selena gomez|the killers|alan ritchson|olivia wilde|rachel weisz|ricky martin|gwen stefani|liam gallagher|oasis reunion|broadway|musical|apple tv\+ drama|apple tv\+ series|apple tv\+ show|imperfect women|joel kinnaman|biopic|pride 2026|manchester pride|madonna|vmas|vma awards|mtv vmas|survivor greece|bruno mars)\b/i,
    secondaryTitle: /\b(drama series|tv show|tv shows|movie star|pop star|hit song|music video|singer|singers|hollywood blockbuster|chart single|headline tour)\b/i,
    primaryBody: /\b(premiere|premiered|cinematic|screening|soundtrack|discography|billboard|cameo|fandom|casting|cast member|film set|behind the scenes|tv series|television series|miniseries|box-office|hit single|chart-topping|paparazzi|broadway|musical|acting)\b/i,
  },
  Technology: {
    primaryTitle: /\b(iphone|ipad|macbook|ios|android|samsung galaxy|samsung smartphone|samsung phone|samsung chip|samsung display|samsung tv|apple iphone|apple ipad|apple macbook|apple watch|apple vision|apple chip|apple silicon|apple os|apple ios|apple app store|apple antitrust|apple ai|apple security|big tech|nvidia|nvidia ai|nvidia chip|nvidia gpu|microsoft|google ai|openai|chatgpt|gemini ai|claude ai|anthropic claude|claude model|claude llm|claude chatbot|llm|generative ai|ai model|artificial intelligence|cybersecurity|semiconductor|chipmaker|smartphone|smartphones|tech gadget|gadgets|software update|hardware|cloud computing|operating system|open source|app store|play store|tech giant|silicon valley|next\.js|react framework|flock safety|raspberry pi|spacex|starship|ai chip|space technology|orbital flight|chipset|microchip|tech market)\b/i,
    secondaryTitle: /\b(tech sector|app update|digital platform|cyber attack|data breach|software bug|firmware update)\b/i,
    primaryBody: /\b(processor|gpu|cpu|ram|battery life|display tech|firmware|cyber attack|malware|data breach|vulnerability|algorithm|neural network|deep learning|machine learning|saas|api|developer tools|tech market|tech sector|silicon|microchip|orbital flight)\b/i,
  },
  Economics: {
    primaryTitle: /\b(inflation|central bank|central banks|interest rate|interest rates|rate cut|rate cuts|rate hike|rate hikes|stock market|stocks|crypto|bitcoin|ethereum|binance|wall street|earnings|pension|pension reform|gdp|recession|financial market|banking sector|federal reserve|fed rate|treasury yields|wall st|dow jones|s&p 500|nasdaq|bond yield|bonds|monetary policy|cts eventim|vanguard|ipo|etf|savings deals|financial times|minijob|diageo|pharmacies levy|behari lal|stock market crash|cpi|interest-rate|rate-cut|rate-hike|crypto trading|crypto exchange|government debt|national debt|public debt|debt ceiling|loblaws|sobeys|supermarket chain|price-fixing lawsuit|commercial lawsuit|tariff|tariffs|retaliation tariff|trade market|trade deficit|trade war)\b/i,
    secondaryTitle: /\b(quarterly revenue|company profit|market cap|investors|finance|business news|economic growth|import tax|taxation policy)\b/i,
    primaryBody: /\b(quarterly earnings|profit margin|fiscal year|dividend|shareholders|market cap|initial public offering|ipo|venture capital|bankrupt|bankruptcy|debt ceiling|trade deficit|tariff|tariffs|consumer price index|cpi|unemployment rate|financial market|monetary policy|federal reserve)\b/i,
  },
  Politics: {
    primaryTitle: /\b(election|elections|political poll|voting process|voters|ballot|biden|donald trump|president trump|trump administration|trump tariffs?|trump policy|trump policies|trump government|trump campaign|trump white house|trump cabinet|trump executive order|trump order|trump decree|trump appointee|starmer|modi|putin|macron|scholz|politics|political|parliament|senate|congress|prime minister|premier(?! league)|government official|government minister|government cabinet|government policy|government administration|government shutdown|government reshuffle|government decree|constitutional lawsuit|supreme court|scotus|legislation|statute|cabinet minister|sanctions|white house|capitol hill|impeachment|campaign candidate|keir starmer|tom homan|justice minister|palestine action|scotus ruling|governor|lawmaker|lawmakers|mp|mps|diplomat|diplomats|state department|whitehouse|chancellor|politician|politicians|doug ford)\b/i,
    secondaryTitle: /\b(court ruling|judge ruling|legal battle|bill passed|veto|subpoena|decree|pardon|political party|electoral)\b/i,
    primaryBody: /\b(legislative|bipartisan|democrats|republicans|tories|labour party|parliamentary|governor|mayor|constitution|constitutional|executive order|veto|policy proposal|political party|lawmakers|jurisdiction|election campaign|presidential|cabinet meeting)\b/i,
  },
  'Social-Media': {
    primaryTitle: /\b(tiktok|instagram|youtube video|youtube channel|youtube creator|x\.com|twitter platform|threads app|reels|shorts|influencer|influencers|content creator|creators|streamer|streamers|tiktokers?|youtubers?|trending hashtag|social media platform|social media trend|going viral|viral trend|viral video|viral creator|internet culture|neil the seal|rosenheim|vlogger|creator|influencer controversy)\b/i,
    secondaryTitle: /\b(social media post|trending online|online trend|viral post)\b/i,
    primaryBody: /\b(follower|followers|going viral|subscribers|algorithm|shadowban|content creation|vlog|vlogger|meme|memes|feed|post|posted|engagement rate|social platform)\b/i,
  },
  'World Affairs': {
    primaryTitle: /\b(severe weather|meteorological|meteorology|weather alert|catastrophic storm|storms|cyclone|typhoon|hurricane|tsunami warning|tsunami wave|tsunami disaster|devastating tsunami|tsunami alert|devastating flood|earthquake|natural disaster|humanitarian disaster|disaster relief|disaster zone|disaster area|catastrophic disaster|diplomacy|astronomy|gaza|israel|ukraine|russia|war in|war zone|world war|civil war|military war|declaration of war|outbreak of war|warfare|war conflict|russia-ukraine war|israel-hamas war|gaza war|ukraine war|ceasefire|peace talks|united nations|un security council|nato|refugee|refugees|humanitarian crisis|foreign policy|geopolitics|embassy|envoy|international conflict|global summit)\b/i,
    secondaryTitle: /\b(global affairs|international news|worldwide crisis|foreign relations|airstrike|border conflict|refugee crisis)\b/i,
    primaryBody: /\b(international relations|global summit|bilateral talks|sovereignty|peacekeeping|conflict zone|casualty|casualties|evacuation|disaster relief|meteorologists|seismic|global affairs|worldwide conflict|airstrike|ceasefire)\b/i,
  },
};

/**
 * Robust Hybrid Classifier for Primary Subject Identification
 */
export function classifyArticle(input: ClassificationInput): ClassificationResult {
  const { title = '', summary = '', content = '', sourceCategory, geminiCategory } = input;
  const lowerTitle = title.toLowerCase();
  const lowerSummary = summary.toLowerCase();
  const lowerContent = content.toLowerCase();
  const lowerBody = `${lowerSummary} ${lowerContent}`.trim();

  const canonicalGemini = canonicalizeCategory(geminiCategory);
  const canonicalSource = canonicalizeCategory(sourceCategory);

  // Track scoring details per category
  const titleScores: Record<CanonicalCategory, { primary: number; secondary: number; matches: string[] }> = {
    Sports: { primary: 0, secondary: 0, matches: [] },
    Politics: { primary: 0, secondary: 0, matches: [] },
    'World Affairs': { primary: 0, secondary: 0, matches: [] },
    Economics: { primary: 0, secondary: 0, matches: [] },
    Technology: { primary: 0, secondary: 0, matches: [] },
    Entertainment: { primary: 0, secondary: 0, matches: [] },
    'Social-Media': { primary: 0, secondary: 0, matches: [] },
  };

  const bodyScores: Record<CanonicalCategory, { primary: number; secondary: number; matches: string[] }> = {
    Sports: { primary: 0, secondary: 0, matches: [] },
    Politics: { primary: 0, secondary: 0, matches: [] },
    'World Affairs': { primary: 0, secondary: 0, matches: [] },
    Economics: { primary: 0, secondary: 0, matches: [] },
    Technology: { primary: 0, secondary: 0, matches: [] },
    Entertainment: { primary: 0, secondary: 0, matches: [] },
    'Social-Media': { primary: 0, secondary: 0, matches: [] },
  };

  for (const cat of CANONICAL_CATEGORIES) {
    const p = PATTERNS[cat];

    // Primary Title Matches (100 pts per unique match)
    const pTitleMatches = lowerTitle.match(new RegExp(p.primaryTitle, 'gi'));
    if (pTitleMatches) {
      const unique = Array.from(new Set(pTitleMatches.map(m => m.toLowerCase())));
      titleScores[cat].primary = unique.length * 100;
      titleScores[cat].matches.push(...unique);
    }

    // Secondary Title Matches (20 pts per unique match)
    if (p.secondaryTitle) {
      const sTitleMatches = lowerTitle.match(new RegExp(p.secondaryTitle, 'gi'));
      if (sTitleMatches) {
        const unique = Array.from(new Set(sTitleMatches.map(m => m.toLowerCase())));
        titleScores[cat].secondary = unique.length * 20;
        titleScores[cat].matches.push(...unique);
      }
    }

    // Primary Body Matches (25 pts per match up to 75 pts max)
    const pBodyMatches = lowerBody.match(new RegExp(p.primaryBody, 'gi'));
    if (pBodyMatches) {
      const unique = Array.from(new Set(pBodyMatches.map(m => m.toLowerCase())));
      const count = Math.min(unique.length, 3);
      bodyScores[cat].primary = count * 25;
      bodyScores[cat].matches.push(...unique.slice(0, 3));
    }

    // Secondary Body Matches (5 pts per match up to 15 pts max)
    if (p.secondaryBody) {
      const sBodyMatches = lowerBody.match(new RegExp(p.secondaryBody, 'gi'));
      if (sBodyMatches) {
        const unique = Array.from(new Set(sBodyMatches.map(m => m.toLowerCase())));
        const count = Math.min(unique.length, 3);
        bodyScores[cat].secondary = count * 5;
        bodyScores[cat].matches.push(...unique.slice(0, 3));
      }
    }
  }

  // Calculate total title score and total overall score
  const categoryStats: Record<CanonicalCategory, {
    titleScore: number;
    bodyScore: number;
    aiBoost: number;
    sourceBoost: number;
    totalScore: number;
    signals: string[];
  }> = {} as any;

  for (const cat of CANONICAL_CATEGORIES) {
    const tScore = titleScores[cat].primary + titleScores[cat].secondary;
    const bScore = bodyScores[cat].primary + bodyScores[cat].secondary;

    // AI & Source boosts (additive, but cannot override strong title mismatch)
    let aiBoost = 0;
    if (canonicalGemini === cat) {
      aiBoost = (tScore > 0 || bScore > 0) ? 30 : 15;
    }

    let sourceBoost = 0;
    if (canonicalSource === cat) {
      sourceBoost = (tScore > 0 || bScore > 0) ? 20 : 10;
    }

    const totalScore = tScore + bScore + aiBoost + sourceBoost;
    const signals: string[] = [];

    if (tScore > 0) {
      signals.push(`Primary title subject: ${cat} (${titleScores[cat].matches.join(', ')})`);
    }
    if (bScore > 0) {
      signals.push(`Body ${cat.toLowerCase()} signals: ${bodyScores[cat].matches.join(', ')}`);
    }
    if (canonicalGemini === cat) {
      signals.push(`Gemini AI suggestion: ${cat}`);
    }
    if (canonicalSource === cat) {
      signals.push(`Explicit source category: ${sourceCategory}`);
    }

    categoryStats[cat] = {
      titleScore: tScore,
      bodyScore: bScore,
      aiBoost,
      sourceBoost,
      totalScore,
      signals,
    };
  }

  // Find top categories by Title Score & Total Score
  let topTitleCat: CanonicalCategory | null = null;
  let highestTitleScore = 0;
  let runnerUpTitleScore = 0;

  let topTotalCat: CanonicalCategory = 'World Affairs';
  let highestTotalScore = -1;
  let runnerUpTotalScore = -1;

  for (const cat of CANONICAL_CATEGORIES) {
    const ts = categoryStats[cat].titleScore;
    if (ts > highestTitleScore) {
      runnerUpTitleScore = highestTitleScore;
      highestTitleScore = ts;
      topTitleCat = cat;
    } else if (ts > runnerUpTitleScore) {
      runnerUpTitleScore = ts;
    }

    const tot = categoryStats[cat].totalScore;
    if (tot > highestTotalScore) {
      runnerUpTotalScore = highestTotalScore;
      highestTotalScore = tot;
      topTotalCat = cat;
    } else if (tot > runnerUpTotalScore) {
      runnerUpTotalScore = tot;
    }
  }

  // DECISION LAYER 1: Strong Primary Title Dominance (>= 100 pts and strictly highest title score)
  if (topTitleCat && highestTitleScore >= 100 && highestTitleScore > runnerUpTitleScore) {
    const matchedSignals = [...categoryStats[topTitleCat].signals];
    if (canonicalGemini && canonicalGemini !== topTitleCat) {
      matchedSignals.push(`Gemini conflict ignored: ${canonicalGemini} (stronger ${topTitleCat} title signal)`);
    }

    return {
      category: topTitleCat,
      confidence: Math.min(98, 85 + (highestTitleScore >= 200 ? 10 : 5)),
      matchedSignals,
      reason: `Strong Primary Title Subject "${topTitleCat}" (${highestTitleScore} pts title score)`,
      method: 'PRIMARY_SUBJECT',
    };
  }

  // DECISION LAYER 2: Moderate Title Subject or Dominant Total Score
  if (highestTotalScore >= 40) {
    const isAiMethod = canonicalGemini === topTotalCat && categoryStats[topTotalCat].aiBoost > 0;
    const isExplicitSource = canonicalSource === topTotalCat && categoryStats[topTotalCat].sourceBoost > 0;

    let method: ClassificationResult['method'] = 'PRIMARY_SUBJECT';
    if (isAiMethod) method = 'AI';
    else if (isExplicitSource) method = 'EXPLICIT_SOURCE';

    const matchedSignals = [...categoryStats[topTotalCat].signals];
    if (canonicalGemini && canonicalGemini !== topTotalCat) {
      matchedSignals.push(`Gemini conflict ignored: ${canonicalGemini} (overridden by top subject score ${topTotalCat})`);
    }

    return {
      category: topTotalCat,
      confidence: Math.min(95, 70 + Math.floor(highestTotalScore / 10)),
      matchedSignals,
      reason: `Primary Subject Match (${highestTotalScore} pts total score)`,
      method,
    };
  }

  // DECISION LAYER 3: Clean Gemini AI Fallback (if valid category and no title conflict)
  if (canonicalGemini) {
    return {
      category: canonicalGemini,
      confidence: 75,
      matchedSignals: [`Gemini AI output: "${geminiCategory}"`],
      reason: `AI semantic suggestion without conflicting title signals`,
      method: 'AI',
    };
  }

  // DECISION LAYER 4: Clean Source Category Fallback
  if (canonicalSource) {
    return {
      category: canonicalSource,
      confidence: 72,
      matchedSignals: [`Explicit Source: "${sourceCategory}"`],
      reason: `Trusted explicit source category "${sourceCategory}"`,
      method: 'EXPLICIT_SOURCE',
    };
  }

  // DECISION LAYER 5: Final Fallback: World Affairs
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
