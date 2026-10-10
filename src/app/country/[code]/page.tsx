import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllArticles } from "@/lib/mdx";
import { COUNTRY_DATA, getFlagImageUrl, getCountryForArticle } from "@/lib/country-utils";
import { Metadata } from "next";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CountryPageClient } from "./CountryPageClient";

export const dynamic = 'force-static';

interface CountryPageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(COUNTRY_DATA).map((code) => ({
    code: code.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const country = COUNTRY_DATA[upperCode] || { name: upperCode, flag: '🌐', code: upperCode };
  const countryUrl = `https://www.whythisbuzz.com/country/${code.toLowerCase()}`;
  const isUS = upperCode === 'US';
  const isUK = upperCode === 'GB';

  const title = `${country.name} News & Breaking Trends Explained | WhyThisBuzz`;
  const description = `Read breaking news, viral stories, politics, sports, and cultural explainers from ${country.name}. Real-time Google Trends analysis updated 24/7.`;

  return {
    title,
    description,
    keywords: [
      `${country.name} news`,
      `${country.name} trending topics`,
      `${country.name} breaking news`,
      `${country.name} current events`,
      'WhyThisBuzz',
      'trending news explained'
    ],
    alternates: {
      canonical: countryUrl,
      languages: isUS
        ? { 'en-US': countryUrl, 'x-default': countryUrl }
        : isUK
        ? { 'en-GB': countryUrl, 'x-default': countryUrl }
        : { 'en': countryUrl, 'x-default': countryUrl },
    },
    openGraph: {
      title,
      description,
      url: countryUrl,
      siteName: 'WhyThisBuzz',
      type: 'website',
      locale: isUS ? 'en_US' : isUK ? 'en_GB' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@whythisbuzz',
      creator: '@whythisbuzz',
    },
    other: {
      ...(isUS ? { 'geo.region': 'US', 'geo.placename': 'United States' } : {}),
      ...(isUK ? { 'geo.region': 'GB', 'geo.placename': 'United Kingdom' } : {}),
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const country = COUNTRY_DATA[upperCode] || {
    code: upperCode,
    name: upperCode,
    flag: '🌐',
    flagUrl: `https://flagcdn.com/w40/${code.toLowerCase()}.png`
  };

  // Fetch initial articles matching this country for complete SSR/prerender
  const allMdx = await getAllArticles(1000);
  const countryMdxArticles = allMdx
    .map(a => a.metadata)
    .filter(a => {
      const c = getCountryForArticle(a.country);
      return c.code.toUpperCase() === upperCode;
    });

  // Sort countryMdxArticles strictly by recency timestamp descending
  countryMdxArticles.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Generate structured data schemas
  const { generateCountryPageSchema, generateBreadcrumbSchema, generateJsonLd, generateCombinedSchema } = await import('@/lib/structured-data');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.whythisbuzz.com' },
    { name: `${country.name} News`, url: `https://www.whythisbuzz.com/country/${code.toLowerCase()}` },
  ]);
  const countrySchema = generateCountryPageSchema(country.name, country.code, countryMdxArticles.length);
  const combinedSchema = generateCombinedSchema(breadcrumbSchema, countrySchema);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(combinedSchema) }}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-7xl px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-accent flex items-center gap-1 transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Countries</span>
            <span>/</span>
            <span className="text-accent font-semibold">{country.name}</span>
          </div>

          {/* Header Banner */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 mb-8 shadow-editorial relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0 border border-border/50 bg-muted">
                  <img
                    src={getFlagImageUrl(country.code)}
                    alt={country.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  {/* <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Region Archive
                  </div> */}
                  <h1 className="text-2xl sm:text-4xl font-serif font-bold text-foreground tracking-tight">
                    {country.name} Trends & News
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    All breaking news and trending topics from {country.name}, ordered from latest to oldest.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Client Component for live Supabase fetch & category filtering */}
          <CountryPageClient countryCode={country.code} countryName={country.name} initialArticles={countryMdxArticles} />

          {/* Complete Country Story Directory for Search Engine Crawlers & Full Indexation */}
          {countryMdxArticles.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-serif font-bold text-foreground">
                  Complete {country.name} Directory
                </h2>
                <span className="text-xs text-muted-foreground font-mono bg-secondary px-2.5 py-1 rounded-full border border-border/60 self-start sm:self-auto">
                  {countryMdxArticles.length} Stories Indexed
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                Crawlable index of all breaking news, cultural trends, and analyses published for {country.name}.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                {countryMdxArticles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.id}`}
                    className="text-muted-foreground hover:text-accent transition-colors truncate py-1.5 border-b border-border/30 hover:border-accent/40 flex items-center justify-between gap-3 group"
                    title={art.title}
                  >
                    <span className="truncate group-hover:text-foreground">{art.title}</span>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 font-mono">{art.date}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}
