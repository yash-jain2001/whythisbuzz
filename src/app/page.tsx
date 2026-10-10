import { Navbar } from "@/components/Navbar";
import { TrendingTicker } from "@/components/TrendingTicker";
import { ArticleGrid } from "@/components/ArticleGrid";
import { CategorySection } from "@/components/CategorySection";
import { getAllArticles, getArticlesByCategory } from "@/lib/mdx";
import { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "WhyThisBuzz - Trending News, Digital Culture & Tech Explained",
  description: "Your daily guide to the internet. We break down complex news, pop culture drama, tech innovations, and global affairs into easy-to-understand stories.",
  keywords: ["trending news", "digital culture", "technology explained", "pop culture", "world affairs", "WhyThisBuzz", "US breaking news", "UK trending news"],
  alternates: {
    canonical: 'https://www.whythisbuzz.com',
    languages: {
      'en': 'https://www.whythisbuzz.com',
      'en-US': 'https://www.whythisbuzz.com',
      'en-GB': 'https://www.whythisbuzz.com',
      'x-default': 'https://www.whythisbuzz.com',
    },
  },
  openGraph: {
    title: "WhyThisBuzz - Trending News, Digital Culture & Tech Explained",
    description: "Your daily guide to the internet. We break down complex news, pop culture drama, tech innovations, and global affairs into easy-to-understand stories.",
    url: "https://www.whythisbuzz.com",
    siteName: "WhyThisBuzz",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.whythisbuzz.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WhyThisBuzz - Trending News Explained",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhyThisBuzz - Trending News, Digital Culture & Tech Explained",
    description: "Your daily guide to the internet. We break down complex news, pop culture drama, tech innovations, and global affairs.",
    images: ["https://www.whythisbuzz.com/images/og-image.jpg"],
    site: "@whythisbuzz",
    creator: "@whythisbuzz",
  },
};

export default async function Home() {
  const allArticles = await getAllArticles(20);
  const gridArticles = allArticles.map(a => a.metadata);

  const [
    worldAffairsArticles,
    politicsArticles,
    economicsArticles,
    sportsArticles,
    moviesAndEntertainmentArticles,
    socialMediaArticles,
    techArticles
  ] = await Promise.all([
    getArticlesByCategory('World Affairs', 8),
    getArticlesByCategory('Politics', 8),
    getArticlesByCategory('Economics', 8),
    getArticlesByCategory('Sports', 8),
    getArticlesByCategory('Movies', 8),
    getArticlesByCategory('Social-Media', 8),
    getArticlesByCategory('Technology', 8)
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <TrendingTicker initialArticles={gridArticles} />

      <main className="flex-1">
        <ArticleGrid articles={gridArticles} />

        {/* Regional Hubs Spotlight (US, UK, Global) */}
        <section className="container max-w-7xl py-6 my-4">
          <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-2xl p-6 sm:p-8 border border-border/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block mb-1">
                Regional News Desks
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                Trending Stories by Country
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Explore dedicated real-time coverage tailored specifically for readers in the United States and the United Kingdom.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/country/us"
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border/80 shadow-xs transition-all flex items-center gap-2 font-medium text-sm"
              >
                <span className="text-lg">🇺🇸</span>
                <span>United States Hub</span>
              </Link>
              <Link
                href="/country/gb"
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border/80 shadow-xs transition-all flex items-center gap-2 font-medium text-sm"
              >
                <span className="text-lg">🇬🇧</span>
                <span>United Kingdom Hub</span>
              </Link>
              <Link
                href="/country/global"
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border/80 shadow-xs transition-all flex items-center gap-2 font-medium text-sm"
              >
                <span className="text-lg">🌐</span>
                <span>Global Edition</span>
              </Link>
            </div>
          </div>
        </section>

        <CategorySection
          id="world-affairs"
          title="World Affairs"
          description="Global events, diplomacy, and international relations explained clearly."
          articles={worldAffairsArticles}
        />

        <CategorySection
          id="politics"
          title="Politics"
          description="Elections, government policies, leaders, and political developments."
          articles={politicsArticles}
        />

        <CategorySection
          id="economics"
          title="Economics & Business"
          description="Markets, inflation, trade, central bank policies, and global finance."
          articles={economicsArticles}
        />

        <CategorySection
          id="sports"
          title="Sports"
          description="Analysis, highlights, and deep dives into the world of sports."
          articles={sportsArticles}
        />

        <CategorySection
          id="movies"
          title="Movies & Entertainment"
          description="Box office trends, industry drama, and cinema news explained without the hype."
          articles={moviesAndEntertainmentArticles}
        />

        <CategorySection
          id="social-media"
          title="Social Media"
          description="Platform updates, viral moments, and digital culture decoded for everyone."
          articles={socialMediaArticles}
        />

        <CategorySection
          id="technology"
          title="Technology"
          description="The latest in AI, frameworks, and developer tools."
          articles={techArticles}
        />


      </main>

      <Footer />
    </div>
  );
}
