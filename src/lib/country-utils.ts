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
  CO: { code: 'CO', name: 'Colombia', flag: '🇨🇴', flagUrl: 'https://flagcdn.com/w40/co.png' },
  AR: { code: 'AR', name: 'Argentina', flag: '🇦🇷', flagUrl: 'https://flagcdn.com/w40/ar.png' },
  TR: { code: 'TR', name: 'Turkey', flag: '🇹🇷', flagUrl: 'https://flagcdn.com/w40/tr.png' },
  UA: { code: 'UA', name: 'Ukraine', flag: '🇺🇦', flagUrl: 'https://flagcdn.com/w40/ua.png' },
  IL: { code: 'IL', name: 'Israel', flag: '🇮🇱', flagUrl: 'https://flagcdn.com/w40/il.png' },
  ZA: { code: 'ZA', name: 'South Africa', flag: '🇿🇦', flagUrl: 'https://flagcdn.com/w40/za.png' },
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬', flagUrl: 'https://flagcdn.com/w40/ng.png' },
  EG: { code: 'EG', name: 'Egypt', flag: '🇪🇬', flagUrl: 'https://flagcdn.com/w40/eg.png' },
  SA: { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', flagUrl: 'https://flagcdn.com/w40/sa.png' },
  AE: { code: 'AE', name: 'UAE', flag: '🇦🇪', flagUrl: 'https://flagcdn.com/w40/ae.png' },
  PK: { code: 'PK', name: 'Pakistan', flag: '🇵🇰', flagUrl: 'https://flagcdn.com/w40/pk.png' },
  BD: { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', flagUrl: 'https://flagcdn.com/w40/bd.png' },
};

/**
 * Detect country flag and name from explicit country code, keyword matching, or title hash fallback
 */
export function getCountryForArticle(countryCode?: string, title?: string, summary?: string): CountryDetails {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  // 1. Explicit United States keywords (Boston, Tornado, Vermont, Miami, etc.)
  if (text.includes('boston') || text.includes('tornado') || text.includes('vermont') || text.includes('miami') || text.includes('dolphins') || text.includes('nfl') || text.includes('nba') || text.includes('pixel') || text.includes('us ') || text.includes('usa') || text.includes('america') || text.includes('hawaii') || text.includes('texas') || text.includes('california') || text.includes('chicago') || text.includes('washington') || text.includes('biden') || text.includes('trump') || text.includes('marvel') || text.includes('avengers')) {
    return COUNTRY_DATA.US;
  }
  // 2. Explicit India keywords
  if (text.includes('india') || text.includes('indian') || text.includes('bcci') || text.includes('ipl') || text.includes('delhi') || text.includes('mumbai') || text.includes('rupee') || text.includes('bollywood') || text.includes('virat') || text.includes('rohit') || text.includes('shubman') || text.includes('bumrah') || text.includes('modi') || text.includes('gandhi') || text.includes('bengaluru') || text.includes('hyderabad') || text.includes('chennai') || text.includes('kolkata') || text.includes('kerala') || text.includes('punjab') || text.includes('nifty') || text.includes('sensex') || text.includes('isro') || text.includes('tata') || text.includes('jiohotstar') || text.includes('jio')) {
    return COUNTRY_DATA.IN;
  }
  // 3. Explicit United Kingdom keywords
  if (text.includes('uk') || text.includes('britain') || text.includes('british') || text.includes('london') || text.includes('coventry') || text.includes('farage') || text.includes('clacton') || text.includes('wolves') || text.includes('blackburn') || text.includes('championship') || text.includes('premier league') || text.includes('tottenham') || text.includes('spurs') || text.includes('arsenal') || text.includes('chelsea') || text.includes('manchester') || text.includes('liverpool') || text.includes('bergvall') || text.includes('heathrow')) {
    return COUNTRY_DATA.GB;
  }
  // 4. Colombia
  if (text.includes('colombia') || text.includes('colombian') || text.includes('bogota')) {
    return COUNTRY_DATA.CO;
  }
  // 5. Argentina
  if (text.includes('argentina') || text.includes('argentinian') || text.includes('buenos aires') || text.includes('messi')) {
    return COUNTRY_DATA.AR;
  }
  // 6. Turkey
  if (text.includes('turkey') || text.includes('turkish') || text.includes('istanbul') || text.includes('ankara') || text.includes('galatasaray') || text.includes('süper lig')) {
    return COUNTRY_DATA.TR;
  }
  // 7. Ukraine
  if (text.includes('ukraine') || text.includes('ukrainian') || text.includes('kyiv')) {
    return COUNTRY_DATA.UA;
  }
  // 8. Israel
  if (text.includes('israel') || text.includes('israeli') || text.includes('tel aviv')) {
    return COUNTRY_DATA.IL;
  }
  // 9. Netherlands
  if (text.includes('zaandam') || text.includes('amsterdam') || text.includes('dutch') || text.includes('netherlands') || text.includes('rotterdam')) {
    return COUNTRY_DATA.NL;
  }
  // 10. South Korea
  if (text.includes('korea') || text.includes('seoul') || text.includes('송도') || text.includes('sk뷰') || text.includes('k-pop') || text.includes('hangul') || text.includes('korean') || text.includes('삼성sdi')) {
    return COUNTRY_DATA.KR;
  }
  // 11. Japan
  if (text.includes('japan') || text.includes('tokyo') || text.includes('japanese') || text.includes('sushi') || text.includes('anime') || text.includes('nintendo')) {
    return COUNTRY_DATA.JP;
  }
  // 12. Germany
  if (text.includes('germany') || text.includes('german') || text.includes('bundesliga') || text.includes('regionalliga') || text.includes('bocholt') || text.includes('berlin') || text.includes('munich')) {
    return COUNTRY_DATA.DE;
  }
  // 13. France
  if (text.includes('france') || text.includes('french') || text.includes('paris') || text.includes('monaco') || text.includes('macron')) {
    return COUNTRY_DATA.FR;
  }
  // 14. Mexico
  if (text.includes('mexico') || text.includes('mexican') || text.includes('gimnasio') || text.includes('campestre') || text.includes('pesos') || text.includes('klitbo') || text.includes('bbva')) {
    return COUNTRY_DATA.MX;
  }
  // 15. Spain
  if (text.includes('spain') || text.includes('spanish') || text.includes('madrid') || text.includes('barcelona') || text.includes('la liga') || text.includes('tiempo') || text.includes('zaragoza')) {
    return COUNTRY_DATA.ES;
  }
  // 16. Italy
  if (text.includes('italy') || text.includes('italian') || text.includes('rome') || text.includes('milan') || text.includes('atalanta') || text.includes('serie a') || text.includes('lavitola') || text.includes('ranucci')) {
    return COUNTRY_DATA.IT;
  }
  // 17. Canada
  if (text.includes('canada') || text.includes('canadian') || text.includes('toronto') || text.includes('vancouver')) {
    return COUNTRY_DATA.CA;
  }
  // 18. Australia
  if (text.includes('australia') || text.includes('australian') || text.includes('sydney') || text.includes('melbourne') || text.includes('brisbane')) {
    return COUNTRY_DATA.AU;
  }
  // 19. Brazil
  if (text.includes('brazil') || text.includes('brazilian') || text.includes('neymar') || text.includes('rio')) {
    return COUNTRY_DATA.BR;
  }
  // 20. Singapore
  if (text.includes('singapore') || text.includes('singaporean')) {
    return COUNTRY_DATA.SG;
  }
  // 21. China
  if (text.includes('china') || text.includes('chinese') || text.includes('beijing') || text.includes('shanghai')) {
    return COUNTRY_DATA.CN;
  }
  // 22. Saudi Arabia
  if (text.includes('saudi') || text.includes('riyadh') || text.includes('al nassr')) {
    return COUNTRY_DATA.SA;
  }
  // 23. UAE
  if (text.includes('uae') || text.includes('dubai') || text.includes('abu dhabi')) {
    return COUNTRY_DATA.AE;
  }

  // If no explicit text keyword found, check if passed countryCode is valid
  if (countryCode && COUNTRY_DATA[countryCode.toUpperCase()]) {
    return COUNTRY_DATA[countryCode.toUpperCase()];
  }

  // Default to US (United States / Global) for unassigned international trends
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
