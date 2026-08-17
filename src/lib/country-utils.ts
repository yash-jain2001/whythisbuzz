export interface CountryDetails {
  code: string;
  name: string;
  flag: string;
  flagUrl: string;
}

export function getFlagImageUrl(countryCode: string): string {
  const code = (countryCode || 'global').toLowerCase();
  if (code === 'global' || code === 'un') return 'https://flagcdn.com/w40/un.png';
  return `https://flagcdn.com/w40/${code}.png`;
}

export const COUNTRY_DATA: Record<string, CountryDetails> = {
  GLOBAL: { code: 'GLOBAL', name: 'Global', flag: '🌐', flagUrl: 'https://flagcdn.com/w40/un.png' },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w40/us.png' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', flagUrl: 'https://flagcdn.com/w40/in.png' },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w40/ca.png' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w40/au.png' },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w40/de.png' },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w40/jp.png' },
  KR: { code: 'KR', name: 'South Korea', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w40/kr.png' },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w40/br.png' },
};

/**
 * Detect country flag and name strictly from explicit scraped origin country code (e.g. 'US', 'IN', 'GB', 'AU')
 * If no origin country code is included, default fallback is Global (🌐)
 */
export function getCountryForArticle(countryCode?: string): CountryDetails {
  if (countryCode && typeof countryCode === 'string') {
    const cleanCode = countryCode.trim().toUpperCase();
    if (COUNTRY_DATA[cleanCode]) {
      return COUNTRY_DATA[cleanCode];
    }
  }

  // Default fallback: Global (🌐)
  return COUNTRY_DATA.GLOBAL;
}

export function detectCountryFromText(countryCode?: string): CountryDetails {
  return getCountryForArticle(countryCode);
}

/**
 * Format relative Google Trends origin time (e.g. "Trending 2h ago", "Trending 5h ago")
 */
export function getRelativeTrendTime(dateStr?: string, createdAt?: string): string {
  const targetDateStr = createdAt || dateStr;
  if (!targetDateStr) return 'Recently Trending';

  const dateObj = new Date(targetDateStr);
  if (isNaN(dateObj.getTime())) return 'Recently Trending';

  const diffMs = Date.now() - dateObj.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Trending 1h ago';
  if (diffHours < 24) return `Trending ${diffHours}h ago`;
  if (diffDays === 1) return 'Trending 1d ago';
  if (diffDays < 7) return `Trending ${diffDays}d ago`;

  return `Trending ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/**
 * Smart Category Normalizer using strict word boundary matching & prioritized category hierarchy
 */
export function normalizeCategory(title?: string, summary?: string, rawCategory?: string): string {
  // If rawCategory is already a clean valid canonical category, trust it!
  if (rawCategory && typeof rawCategory === 'string') {
    const rLower = rawCategory.trim().toLowerCase();
    if (rLower === 'sports' || rLower.includes('sport')) return 'Sports';
    if (rLower === 'entertainment' || rLower === 'movies' || rLower.includes('entertain') || rLower.includes('movie')) return 'Entertainment';
    if (rLower === 'politics' || rLower.includes('politic')) return 'Politics';
    if (rLower === 'economics' || rLower.includes('economic') || rLower.includes('finance')) return 'Economics';
    if (rLower === 'technology' || rLower.includes('tech')) return 'Technology';
    if (rLower === 'social-media' || rLower === 'social media' || rLower.includes('social')) return 'Social-Media';
    if (rLower === 'world affairs' || rLower === 'world-affairs' || rLower.includes('world')) return 'World Affairs';
  }

  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  // 1. Sports (Check transfer market, clubs, matches, leagues FIRST to avoid economics false matches)
  if (/\b(transfer market|club|clubs|manager|midfielder|winger|striker|vs|versus|cricket|football|soccer|basketball|nba|nfl|ipl|bcci|fifa|uefa|olympics|f1|formula 1|wimbledon|tennis|golf|marathon|stadium|championship|tournament|league|atlé|atlético|real madrid|barcelona|manchester|liverpool|arsenal|chelsea|tottenham|bayern|juventus|inter milan)\b/i.test(text)) {
    return 'Sports';
  }

  // 2. Economics & Business
  if (/\b(inflation|central bank|central banks|interest rate|interest rates|rate cut|rate cuts|stock market|stocks|crypto|bitcoin|binance|wall street|earnings|pension|gdp|recession|financial|banking|central bank)\b/i.test(text)) {
    return 'Economics';
  }

  // 3. Technology & AI
  if (/\b(ai video|ai model|artificial intelligence|generative ai|software|cybersecurity|semiconductor|chipmaker|smartphone|hardware|developer|cloud computing|operating system|open source|apple|alibaba|microsoft|nvidia|google ai|chatgpt)\b/i.test(text)) {
    return 'Technology';
  }

  // 4. Entertainment & Movies
  if (/\b(acting|actor|actress|deborah mailman|logies|movie|movies|film|films|cinema|hollywood|bollywood|trailer|episode|season|show|shows|music|singer|singers|concert|oscar|oscars|grammy|filmfare|vimal|elaichi|celebrity|celebrities|box office|netflix|hbo|disney|paramount|twitch|streamer)\b/i.test(text)) {
    return 'Entertainment';
  }

  // 5. Politics
  if (/\b(election|elections|biden|trump|starmer|politic|politics|political|parliament|senate|congress|minister|president|government|lawsuit|supreme court|modi|putin)\b/i.test(text)) {
    return 'Politics';
  }

  // 6. Social Media
  if (/\b(tiktok|instagram|youtube|x\.com|viral|influencer|creator|social media)\b/i.test(text)) {
    return 'Social-Media';
  }

  // 7. World Affairs / Weather & Disasters
  if (/\b(severe weather|meteorological|meteorology|weather alert|weather alerts|storm|storms|cyclone|typhoon|hurricane|tsunami|flood|floods|earthquake|disaster|disasters|diplomacy|astronomy|gaza|israel|ukraine|war|un)\b/i.test(text)) {
    return 'World Affairs';
  }

  return 'World Affairs';
}

export const CATEGORY_MAGAZINE_BANNERS: Record<string, string[]> = {
  Politics: [
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1200&q=80",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80",
  ],
  Technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  ],
  Entertainment: [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  ],
  Economics: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  ],
  "Social-Media": [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  ],
  "World Affairs": [
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f30ac72604?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  ]
};

export function getCategoryFallbackBanner(category?: string, seedText?: string): string {
  const catKey = normalizeCategory('', '', category);
  const banners = CATEGORY_MAGAZINE_BANNERS[catKey] || CATEGORY_MAGAZINE_BANNERS['World Affairs'];
  
  if (!seedText) {
    return banners[0];
  }
  
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % banners.length;
  return banners[index];
}
