export interface CountryDetails {
  code: string;
  name: string;
  flag: string;
  flagUrl: string;
}

export function getFlagImageUrl(countryCode: string): string {
  const code = (countryCode || 'us').toLowerCase();
  return `https://flagcdn.com/w40/${code}.png`;
}

export const COUNTRY_DATA: Record<string, CountryDetails> = {
  US: { code: 'US', name: 'United States', flag: '🇺🇸', flagUrl: 'https://flagcdn.com/w40/us.png' },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', flagUrl: 'https://flagcdn.com/w40/gb.png' },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪', flagUrl: 'https://flagcdn.com/w40/de.png' },
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', flagUrl: 'https://flagcdn.com/w40/in.png' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', flagUrl: 'https://flagcdn.com/w40/ca.png' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', flagUrl: 'https://flagcdn.com/w40/au.png' },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', flagUrl: 'https://flagcdn.com/w40/jp.png' },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', flagUrl: 'https://flagcdn.com/w40/br.png' },
  ES: { code: 'ES', name: 'Spain', flag: '🇪🇸', flagUrl: 'https://flagcdn.com/w40/es.png' },
  IT: { code: 'IT', name: 'Italy', flag: '🇮🇹', flagUrl: 'https://flagcdn.com/w40/it.png' },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽', flagUrl: 'https://flagcdn.com/w40/mx.png' },
  KR: { code: 'KR', name: 'South Korea', flag: '🇰🇷', flagUrl: 'https://flagcdn.com/w40/kr.png' },
  SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', flagUrl: 'https://flagcdn.com/w40/sg.png' },
  NL: { code: 'NL', name: 'Netherlands', flag: '🇳🇱', flagUrl: 'https://flagcdn.com/w40/nl.png' },
  CN: { code: 'CN', name: 'China', flag: '🇨🇳', flagUrl: 'https://flagcdn.com/w40/cn.png' },
};

/**
 * Detect country flag and name from explicit country code or title/summary keywords
 */
export function getCountryForArticle(countryCode?: string, title?: string, summary?: string): CountryDetails {
  if (countryCode && COUNTRY_DATA[countryCode.toUpperCase()]) {
    return COUNTRY_DATA[countryCode.toUpperCase()];
  }

  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  if (text.includes('germany') || text.includes('german') || text.includes('bundesliga') || text.includes('regionalliga') || text.includes('bocholt')) {
    return COUNTRY_DATA.DE;
  }
  if (text.includes('uk') || text.includes('britain') || text.includes('farage') || text.includes('clacton') || text.includes('wolves') || text.includes('blackburn') || text.includes('championship')) {
    return COUNTRY_DATA.GB;
  }
  if (text.includes('india') || text.includes('bcci') || text.includes('ipl') || text.includes('delhi') || text.includes('mumbai')) {
    return COUNTRY_DATA.IN;
  }
  if (text.includes('france') || text.includes('paris') || text.includes('french')) {
    return COUNTRY_DATA.FR;
  }
  if (text.includes('japan') || text.includes('tokyo') || text.includes('japanese')) {
    return COUNTRY_DATA.JP;
  }
  if (text.includes('canada') || text.includes('toronto')) {
    return COUNTRY_DATA.CA;
  }
  if (text.includes('australia') || text.includes('sydney')) {
    return COUNTRY_DATA.AU;
  }
  if (text.includes('spain') || text.includes('la liga') || text.includes('madrid') || text.includes('barcelona')) {
    return COUNTRY_DATA.ES;
  }
  if (text.includes('italy') || text.includes('atalanta') || text.includes('serie a')) {
    return COUNTRY_DATA.IT;
  }
  if (text.includes('brazil') || text.includes('neymar')) {
    return COUNTRY_DATA.BR;
  }

  return COUNTRY_DATA.US;
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
