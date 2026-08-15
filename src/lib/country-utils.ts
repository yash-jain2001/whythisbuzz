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
  RU: { code: 'RU', name: 'Russia', flag: '🇷🇺', flagUrl: 'https://flagcdn.com/w40/ru.png' },
  NI: { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', flagUrl: 'https://flagcdn.com/w40/ni.png' },
};

/**
 * Detect country flag and name from explicit country code, keyword matching, or title hash fallback
 */
export function getCountryForArticle(countryCode?: string, title?: string, summary?: string): CountryDetails {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  // 1. Explicit Country Keyword Recognizers (Overrides default feed if story specifically names a region)
  // India (IN)
  if (text.includes('india') || text.includes('indian') || text.includes('bcci') || text.includes('ipl') || text.includes('delhi') || text.includes('mumbai') || text.includes('rupee') || text.includes('bollywood') || text.includes('virat') || text.includes('rohit') || text.includes('shubman') || text.includes('bumrah') || text.includes('modi') || text.includes('gandhi') || text.includes('bengaluru') || text.includes('hyderabad') || text.includes('chennai') || text.includes('kolkata') || text.includes('kerala') || text.includes('punjab') || text.includes('nifty') || text.includes('sensex') || text.includes('isro') || text.includes('tata') || text.includes('jio') || text.includes('kriti') || text.includes('sanon') || text.includes('shahid') || text.includes('kapoor') || text.includes('rashmika') || text.includes('mandanna') || text.includes('emraan') || text.includes('hashmi') || text.includes('awarapan') || text.includes('cocktail 2') || text.includes('cocktail') || text.includes('isha prayer') || text.includes('isha') || text.includes('shah rukh') || text.includes('salman') || text.includes('akshay') || text.includes('deepika') || text.includes('ranveer') || text.includes('alia') || text.includes('ranbir') || text.includes('hrithik') || text.includes('shraddha') || text.includes('prabhas') || text.includes('allu arjun') || text.includes('ram charan') || text.includes('tollywood') || text.includes('kollywood') || text.includes('zee') || text.includes('dhoni') || text.includes('filmfare') || text.includes('varun') || text.includes('dhawan') || text.includes('kartik') || text.includes('kiara') || text.includes('sidharth')) {
    return COUNTRY_DATA.IN;
  }
  // Russia (RU)
  if (text.includes('russia') || text.includes('russian') || text.includes('moscow') || text.includes('putin') || text.includes('jabloko') || text.includes('kremlin')) {
    return COUNTRY_DATA.RU;
  }
  // Nicaragua (NI)
  if (text.includes('nicaragua') || text.includes('nicaraguan') || text.includes('ortega') || text.includes('managua')) {
    return COUNTRY_DATA.NI;
  }
  // Singapore (SG)
  if (text.includes('singapore') || text.includes('singaporean') || text.includes('changi') || text.includes('marina bay') || text.includes('dbs') || text.includes('nea')) {
    return COUNTRY_DATA.SG;
  }
  // United Kingdom (GB)
  if (text.includes('uk') || text.includes('britain') || text.includes('british') || text.includes('london') || text.includes('coventry') || text.includes('farage') || text.includes('clacton') || text.includes('wolves') || text.includes('blackburn') || text.includes('premier league') || text.includes('tottenham') || text.includes('spurs') || text.includes('arsenal') || text.includes('chelsea') || text.includes('manchester') || text.includes('liverpool') || text.includes('heathrow') || text.includes('bbc') || text.includes('starmer') || text.includes('sunak') || text.includes('king charles') || text.includes('wimbledon') || text.includes('andy burnham') || text.includes('burnham')) {
    return COUNTRY_DATA.GB;
  }
  // Germany (DE)
  if (text.includes('germany') || text.includes('german') || text.includes('bundesliga') || text.includes('bocholt') || text.includes('berlin') || text.includes('munich') || text.includes('bayern') || text.includes('dortmund') || text.includes('frankfurt') || text.includes('scholz') || text.includes('volkswagen') || text.includes('bmw')) {
    return COUNTRY_DATA.DE;
  }
  // Spain (ES)
  if (text.includes('spain') || text.includes('spanish') || text.includes('madrid') || text.includes('barcelona') || text.includes('la liga') || text.includes('zaragoza') || text.includes('real madrid') || text.includes('atletico') || text.includes('sanchez')) {
    return COUNTRY_DATA.ES;
  }
  // Mexico (MX)
  if (text.includes('mexico') || text.includes('mexican') || text.includes('pesos') || text.includes('klitbo') || text.includes('bbva') || text.includes('cancun') || text.includes('guadalajara') || text.includes('liga mx') || text.includes('sheinbaum')) {
    return COUNTRY_DATA.MX;
  }
  // Italy (IT)
  if (text.includes('italy') || text.includes('italian') || text.includes('rome') || text.includes('milan') || text.includes('atalanta') || text.includes('serie a') || text.includes('juventus') || text.includes('inter milan') || text.includes('meloni') || text.includes('venice')) {
    return COUNTRY_DATA.IT;
  }
  // France (FR)
  if (text.includes('france') || text.includes('french') || text.includes('paris') || text.includes('monaco') || text.includes('macron') || text.includes('psg') || text.includes('ligue 1') || text.includes('cannes')) {
    return COUNTRY_DATA.FR;
  }
  // South Korea (KR)
  if (text.includes('korea') || text.includes('seoul') || text.includes('k-pop') || text.includes('bts') || text.includes('blackpink') || text.includes('samsung') || text.includes('hangul') || text.includes('korean')) {
    return COUNTRY_DATA.KR;
  }
  // Japan (JP)
  if (text.includes('japan') || text.includes('tokyo') || text.includes('japanese') || text.includes('sushi') || text.includes('anime') || text.includes('nintendo') || text.includes('yen') || text.includes('toyota') || text.includes('sony')) {
    return COUNTRY_DATA.JP;
  }
  // Canada (CA)
  if (text.includes('canada') || text.includes('canadian') || text.includes('toronto') || text.includes('vancouver') || text.includes('montreal') || text.includes('trudeau') || text.includes('oilers') || text.includes('maple leafs')) {
    return COUNTRY_DATA.CA;
  }
  // Australia (AU)
  if (text.includes('australia') || text.includes('australian') || text.includes('sydney') || text.includes('melbourne') || text.includes('brisbane') || text.includes('afl') || text.includes('nrl') || text.includes('matildas') || text.includes('albanese')) {
    return COUNTRY_DATA.AU;
  }
  // Brazil (BR)
  if (text.includes('brazil') || text.includes('brazilian') || text.includes('neymar') || text.includes('rio') || text.includes('sao paulo') || text.includes('lula') || text.includes('samba')) {
    return COUNTRY_DATA.BR;
  }
  // Netherlands (NL)
  if (text.includes('netherlands') || text.includes('dutch') || text.includes('amsterdam') || text.includes('rotterdam') || text.includes('eredivisie') || text.includes('ajax') || text.includes('werkendam') || text.includes('bondgenoten')) {
    return COUNTRY_DATA.NL;
  }
  // Colombia (CO)
  if (text.includes('colombia') || text.includes('colombian') || text.includes('bogota') || text.includes('medellin') || text.includes('petro')) {
    return COUNTRY_DATA.CO;
  }
  // Argentina (AR)
  if (text.includes('argentina') || text.includes('argentinian') || text.includes('buenos aires') || text.includes('messi') || text.includes('milei')) {
    return COUNTRY_DATA.AR;
  }
  // Turkey (TR)
  if (text.includes('turkey') || text.includes('turkish') || text.includes('istanbul') || text.includes('ankara') || text.includes('galatasaray') || text.includes('süper lig') || text.includes('erdogan')) {
    return COUNTRY_DATA.TR;
  }
  // Ukraine (UA)
  if (text.includes('ukraine') || text.includes('ukrainian') || text.includes('kyiv') || text.includes('zelenskyy')) {
    return COUNTRY_DATA.UA;
  }
  // Israel (IL)
  if (text.includes('israel') || text.includes('israeli') || text.includes('tel aviv') || text.includes('jerusalem') || text.includes('netanyahu')) {
    return COUNTRY_DATA.IL;
  }
  // South Africa (ZA)
  if (text.includes('south africa') || text.includes('johannesburg') || text.includes('cape town') || text.includes('springboks') || text.includes('ramaphosa') || text.includes('richards bay')) {
    return COUNTRY_DATA.ZA;
  }
  // Nigeria (NG)
  if (text.includes('nigeria') || text.includes('nigerian') || text.includes('lagos') || text.includes('abuja') || text.includes('nollywood') || text.includes('afrobeats') || text.includes('tinubu') || text.includes('burna boy')) {
    return COUNTRY_DATA.NG;
  }
  // Egypt (EG)
  if (text.includes('egypt') || text.includes('egyptian') || text.includes('cairo') || text.includes('salah') || text.includes('pyramids')) {
    return COUNTRY_DATA.EG;
  }
  // Saudi Arabia (SA)
  if (text.includes('saudi') || text.includes('riyadh') || text.includes('al nassr') || text.includes('al hilal') || text.includes('ronaldo')) {
    return COUNTRY_DATA.SA;
  }
  // UAE (AE)
  if (text.includes('uae') || text.includes('dubai') || text.includes('abu dhabi') || text.includes('emirates')) {
    return COUNTRY_DATA.AE;
  }
  // Pakistan (PK)
  if (text.includes('pakistan') || text.includes('pakistani') || text.includes('lahore') || text.includes('karachi') || text.includes('psl') || text.includes('imran khan')) {
    return COUNTRY_DATA.PK;
  }
  // Bangladesh (BD)
  if (text.includes('bangladesh') || text.includes('bangladeshi') || text.includes('dhaka') || text.includes('bpl')) {
    return COUNTRY_DATA.BD;
  }
  // China (CN)
  if (text.includes('china') || text.includes('chinese') || text.includes('beijing') || text.includes('shanghai') || text.includes('xi jinping')) {
    return COUNTRY_DATA.CN;
  }
  // United States (US)
  if (text.includes('usa') || text.includes(' united states ') || text.includes('us ') || text.includes('america') || text.includes('boston') || text.includes('vermont') || text.includes('miami') || text.includes('nfl') || text.includes('nba') || text.includes('pixel') || text.includes('hawaii') || text.includes('texas') || text.includes('california') || text.includes('chicago') || text.includes('washington') || text.includes('biden') || text.includes('trump') || text.includes('marvel') || text.includes('avengers')) {
    return COUNTRY_DATA.US;
  }

  // 2. Primary Origin: Direct Passed Country Code (from Google Trends feed or DB column)
  if (countryCode && COUNTRY_DATA[countryCode.toUpperCase()]) {
    return COUNTRY_DATA[countryCode.toUpperCase()];
  }

  // 3. Fallback: Default to US (United States / Global)
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
