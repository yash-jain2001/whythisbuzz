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
 * Detect country flag and name strictly from explicit country code (e.g. 'US', 'IN', 'GB', 'DE')
 * Default fallback is US (United States / Global)
 */
export function getCountryForArticle(countryCode?: string, title?: string, summary?: string): CountryDetails {
  return detectCountryFromText(countryCode, title, summary);
}

export function detectCountryFromText(countryCode?: string, title?: string, summary?: string): CountryDetails {
  const text = `${title || ''} ${summary || ''}`.toLowerCase();

  // Explicit keyword detection
  if (text.includes('deborah mailman') || text.includes('logies') || text.includes('australia') || text.includes('australian') || text.includes('sydney') || text.includes('melbourne') || text.includes('brisbane') || text.includes('afl') || text.includes('matildas') || text.includes('albanese')) {
    return COUNTRY_DATA.AU;
  }
  if (text.includes('colombia') || text.includes('colombian') || text.includes('bogota') || text.includes('medellin') || text.includes('petro')) {
    return COUNTRY_DATA.CO;
  }
  if (text.includes('india') || text.includes('indian') || text.includes('bcci') || text.includes('ipl') || text.includes('delhi') || text.includes('mumbai') || text.includes('rupee') || text.includes('bollywood') || text.includes('virat') || text.includes('rohit') || text.includes('shubman') || text.includes('bumrah') || text.includes('modi') || text.includes('gandhi') || text.includes('bengaluru') || text.includes('hyderabad') || text.includes('chennai') || text.includes('kolkata') || text.includes('kerala') || text.includes('punjab') || text.includes('nifty') || text.includes('sensex') || text.includes('isro') || text.includes('tata') || text.includes('jio') || text.includes('kriti') || text.includes('sanon') || text.includes('shahid') || text.includes('kapoor') || text.includes('rashmika') || text.includes('mandanna') || text.includes('emraan') || text.includes('hashmi') || text.includes('awarapan') || text.includes('cocktail 2') || text.includes('isha prayer') || text.includes('isha') || text.includes('shah rukh') || text.includes('salman') || text.includes('akshay') || text.includes('deepika') || text.includes('ranveer') || text.includes('alia') || text.includes('ranbir') || text.includes('hrithik') || text.includes('shraddha') || text.includes('prabhas') || text.includes('allu arjun') || text.includes('ram charan') || text.includes('tollywood') || text.includes('kollywood') || text.includes('zee') || text.includes('dhoni') || text.includes('filmfare') || text.includes('varun') || text.includes('kartik') || text.includes('kiara') || text.includes('sidharth')) {
    return COUNTRY_DATA.IN;
  }
  if (text.includes('russia') || text.includes('russian') || text.includes('moscow') || text.includes('putin') || text.includes('jabloko') || text.includes('kremlin')) {
    return COUNTRY_DATA.RU;
  }
  if (text.includes('nicaragua') || text.includes('nicaraguan') || text.includes('ortega') || text.includes('managua')) {
    return COUNTRY_DATA.NI;
  }
  if (text.includes('singapore') || text.includes('singaporean') || text.includes('changi') || text.includes('marina bay') || text.includes('dbs') || text.includes('nea')) {
    return COUNTRY_DATA.SG;
  }
  if (text.includes('uk') || text.includes('britain') || text.includes('british') || text.includes('london') || text.includes('coventry') || text.includes('farage') || text.includes('clacton') || text.includes('wolves') || text.includes('blackburn') || text.includes('premier league') || text.includes('tottenham') || text.includes('spurs') || text.includes('arsenal') || text.includes('chelsea') || text.includes('manchester') || text.includes('liverpool') || text.includes('heathrow') || text.includes('bbc') || text.includes('starmer') || text.includes('sunak') || text.includes('king charles') || text.includes('wimbledon') || text.includes('andy burnham') || text.includes('burnham')) {
    return COUNTRY_DATA.GB;
  }
  if (text.includes('germany') || text.includes('german') || text.includes('bundesliga') || text.includes('bocholt') || text.includes('berlin') || text.includes('munich') || text.includes('bayern') || text.includes('dortmund') || text.includes('frankfurt') || text.includes('scholz') || text.includes('volkswagen') || text.includes('bmw')) {
    return COUNTRY_DATA.DE;
  }
  if (text.includes('spain') || text.includes('spanish') || text.includes('madrid') || text.includes('barcelona') || text.includes('la liga') || text.includes('zaragoza') || text.includes('real madrid') || text.includes('atletico') || text.includes('sanchez')) {
    return COUNTRY_DATA.ES;
  }
  if (text.includes('mexico') || text.includes('mexican') || text.includes('pesos') || text.includes('klitbo') || text.includes('bbva') || text.includes('cancun') || text.includes('guadalajara') || text.includes('liga mx') || text.includes('sheinbaum')) {
    return COUNTRY_DATA.MX;
  }
  if (text.includes('italy') || text.includes('italian') || text.includes('rome') || text.includes('milan') || text.includes('atalanta') || text.includes('serie a') || text.includes('juventus') || text.includes('inter milan') || text.includes('meloni') || text.includes('venice')) {
    return COUNTRY_DATA.IT;
  }
  if (text.includes('france') || text.includes('french') || text.includes('paris') || text.includes('monaco') || text.includes('macron') || text.includes('psg') || text.includes('ligue 1') || text.includes('cannes')) {
    return COUNTRY_DATA.FR;
  }
  if (text.includes('korea') || text.includes('seoul') || text.includes('k-pop') || text.includes('bts') || text.includes('blackpink') || text.includes('samsung') || text.includes('hangul') || text.includes('korean')) {
    return COUNTRY_DATA.KR;
  }
  if (text.includes('japan') || text.includes('tokyo') || text.includes('japanese') || text.includes('sushi') || text.includes('anime') || text.includes('nintendo') || text.includes('yen') || text.includes('toyota') || text.includes('sony')) {
    return COUNTRY_DATA.JP;
  }
  if (text.includes('canada') || text.includes('canadian') || text.includes('toronto') || text.includes('vancouver') || text.includes('montreal') || text.includes('trudeau')) {
    return COUNTRY_DATA.CA;
  }
  if (text.includes('brazil') || text.includes('brazilian') || text.includes('neymar') || text.includes('rio') || text.includes('sao paulo') || text.includes('lula')) {
    return COUNTRY_DATA.BR;
  }

  if (countryCode && typeof countryCode === 'string') {
    const cleanCode = countryCode.trim().toUpperCase();
    if (COUNTRY_DATA[cleanCode]) {
      return COUNTRY_DATA[cleanCode];
    }
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
