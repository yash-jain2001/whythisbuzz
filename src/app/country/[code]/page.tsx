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
  const codes = Object.keys(COUNTRY_DATA).map(code => ({
    code: code.toLowerCase(),
  }));
  return codes;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { code } = await params;
  const upperCode = code.toUpperCase();
  const country = COUNTRY_DATA[upperCode] || { name: upperCode, flag: '🌐' };

  return {
    title: `${country.name} News & Breaking Trends - WhyThisBuzz`,
    description: `Read all the latest breaking news, viral stories, and trending topics from ${country.name}. Updated continuously from live Google Trends.`,
    openGraph: {
      title: `${country.name} News & Breaking Trends - WhyThisBuzz`,
      description: `Read all the latest breaking news, viral stories, and trending topics from ${country.name}.`,
      url: `https://whythisbuzz.com/country/${code.toLowerCase()}`,
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

  // Fetch initial articles matching this country from local MDX
  const allMdx = await getAllArticles(200);
  const countryMdxArticles = allMdx
    .map(a => a.metadata)
    .filter(a => {
      const c = getCountryForArticle(a.country, a.title, a.summary);
      return c.code.toUpperCase() === upperCode;
    });

  return (
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
