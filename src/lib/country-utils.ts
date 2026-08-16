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
