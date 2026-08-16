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
  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  // 1. Economics & Business (Check FIRST so Inflation & Central Bank Rate Cuts never get misclassified as Sports)
  if (/\b(inflation|central bank|central banks|interest rate|interest rates|rate cut|rate cuts|stock|stocks|market|markets|fed|federal reserve|banking|finance|economic|economy|crypto|bitcoin|binance|wall street|earnings|pension)\b/i.test(text)) {
    return 'Economics';
  }

  // 2. Entertainment & Movies (Check SECOND so Actors, Movies & TV Shows like Deborah Mailman, Lioness, Bollywood never get misclassified)
  if (/\b(acting|actor|actress|deborah mailman|logies|movie|movies|film|films|cinema|hollywood|bollywood|trailer|episode|season|show|shows|music|singer|singers|concert|oscar|oscars|grammy|filmfare|vimal|elaichi|surrogate|celebrity|celebrities|box office|netflix|hbo|disney|paramount)\b/i.test(text)) {
    return 'Entertainment';
  }

  // 3. World Affairs / Weather & Disasters (Check THIRD so Severe Weather Alerts never get misclassified as Sports)
  if (/\b(severe weather|meteorological|meteorology|weather alert|weather alerts|storm|storms|cyclone|typhoon|hurricane|tsunami|flood|floods|earthquake|disaster|disasters|diplomacy|astronomy|isha prayer|namaz|ramadan)\b/i.test(text)) {
    return 'World Affairs';
  }

  // 4. Politics
  if (/\b(election|elections|biden|trump|starmer|politic|politics|political|parliament|senate|congress|minister|president|government|lawsuit|supreme court|modi|putin)\b/i.test(text)) {
    return 'Politics';
  }

  // 5. Technology
  if (/\b(ai|artificial intelligence|software|cyber|semiconductor|chipmaker|smartphone|hardware|developer|cloud computing|operating system|open source)\b/i.test(text)) {
    return 'Technology';
  }

  // 6. Social Media
  if (/\b(tiktok|instagram|youtube|x\.com|viral|influencer|streamer|creator)\b/i.test(text)) {
    return 'Social-Media';
  }

  // 7. Sports (Strict word boundary checks for vs, match, player, league, etc. to prevent false positive matches)
  if (/\b(vs|versus|cricket|football|soccer|basketball|nba|nfl|ipl|bcci|fifa|uefa|olympics|f1|formula 1|wimbledon|tennis|golf|marathon|stadium|championship|tournament|league|bayern|tottenham|arsenal|chelsea|real madrid|barcelona)\b/i.test(text)) {
    return 'Sports';
  }

  // Fallback to rawCategory if provided by feed
  if (rawCategory) {
    const rLower = rawCategory.toLowerCase();
    if (rLower.includes('sport')) return 'Sports';
    if (rLower.includes('entertain') || rLower.includes('movie')) return 'Entertainment';
    if (rLower.includes('politic')) return 'Politics';
    if (rLower.includes('economic') || rLower.includes('finance')) return 'Economics';
    if (rLower.includes('social')) return 'Social-Media';
    if (rLower.includes('tech')) return 'Technology';
    if (rLower.includes('world')) return 'World Affairs';
  }

  return 'World Affairs';
}
