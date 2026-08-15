'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeletonCard } from "./ArticleSkeletonCard";
import { ArticleMetadata } from "@/lib/mdx";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCountryForArticle, getRelativeTrendTime } from "@/lib/country-utils";
import { Sparkles, Globe, ChevronDown } from "lucide-react";

interface ArticleGridProps {
  articles: ArticleMetadata[];
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

const CATEGORY_TABS = [
  { id: "all", label: "All Categories" },
  { id: "sports", label: "Sports" },
  { id: "world", label: "World Affairs" },
  { id: "politics", label: "Politics" },
  { id: "economics", label: "Economics" },
  { id: "tech", label: "Technology" },
  { id: "social", label: "Social Media" },
  { id: "movies", label: "Movies & Ent." },
];

const COUNTRY_OPTIONS = [
  { code: "all", name: "All Regions" },
  { code: "US", name: "🇺🇸 United States" },
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "IN", name: "🇮🇳 India" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "JP", name: "🇯🇵 Japan" },
  { code: "BR", name: "🇧🇷 Brazil" },
  { code: "ES", name: "🇪🇸 Spain" },
  { code: "IT", name: "🇮🇹 Italy" },
  { code: "MX", name: "🇲🇽 Mexico" },
  { code: "KR", name: "🇰🇷 South Korea" },
  { code: "NL", name: "🇳🇱 Netherlands" },
  { code: "CO", name: "🇨🇴 Colombia" },
  { code: "AR", name: "🇦🇷 Argentina" },
  { code: "TR", name: "🇹🇷 Turkey" },
  { code: "UA", name: "🇺🇦 Ukraine" },
  { code: "IL", name: "🇮🇱 Israel" },
  { code: "ZA", name: "🇿🇦 South Africa" },
  { code: "NG", name: "🇳🇬 Nigeria" },
  { code: "EG", name: "🇪🇬 Egypt" },
  { code: "SA", name: "🇸🇦 Saudi Arabia" },
  { code: "AE", name: "🇦🇪 UAE" },
  { code: "PK", name: "🇵🇰 Pakistan" },
  { code: "BD", name: "🇧🇩 Bangladesh" },
  { code: "SG", name: "🇸🇬 Singapore" },
  { code: "CN", name: "🇨🇳 China" },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function ArticleGrid({ articles: initialArticles }: ArticleGridProps) {
  const router = useRouter();
  const [allArticles, setAllArticles] = useState<ArticleMetadata[]>(() => shuffleArray(initialArticles));
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from('articles')
      .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at, geo')
      .order('created_at', { ascending: false })
      .order('date', { ascending: false })
      .limit(1000)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const liveArticles: ArticleMetadata[] = (data as SupabaseArticleDoc[]).map((doc) => ({
            id: doc.slug,
            title: doc.title,
            description: doc.summary || doc.meta_description || '',
            date: formatDateDisplay(doc.date),
            author: doc.author || 'WhyThisBuzz Desk',
            category: doc.category,
            imageUrl: doc.image_url || '',
            readTime: doc.read_time || '3 min read',
            summary: doc.summary || '',
            seoTitle: doc.seo_title,
            metaDescription: doc.meta_description,
            keywords: doc.keywords,
            country: doc.geo,
            trendTime: getRelativeTrendTime(doc.date, doc.created_at),
          }));
          // Prioritize top 40 newest fresh articles for Trending Now and shuffle among them
          const freshNewestArticles = liveArticles.slice(0, 40);
          setAllArticles(shuffleArray(freshNewestArticles));
        }
        setIsLoading(false);
      });
  }, []);

  const filteredArticles = allArticles.filter((article) => {
    // 1. Category Filter
    if (selectedCategory !== "all") {
      const catLower = article.category.toLowerCase();
      if (selectedCategory === "sports" && !catLower.includes("sport")) return false;
      if (selectedCategory === "world" && !catLower.includes("world")) return false;
      if (selectedCategory === "politics" && !catLower.includes("politic")) return false;
      if (selectedCategory === "economics" && !catLower.includes("economic") && !catLower.includes("finance")) return false;
      if (selectedCategory === "tech" && !catLower.includes("tech")) return false;
      if (selectedCategory === "social" && !catLower.includes("social") && !catLower.includes("media") && !catLower.includes("viral") && !catLower.includes("internet")) return false;
      if (selectedCategory === "movies" && !catLower.includes("movie") && !catLower.includes("entertain")) return false;
    }

    // 2. Country / Region Filter
    if (selectedCountry !== "all") {
      const countryInfo = getCountryForArticle(article.country, article.title, article.summary);
      if (countryInfo.code !== selectedCountry) return false;
    }

    return true;
  });

  const displayedArticles = (selectedCategory === "all" && selectedCountry === "all")
    ? filteredArticles.slice(0, 25)
    : filteredArticles;

  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Trending Now</h2>
          </div>
          
          {/* Controls: Country Selector + Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Country / Region Filter Selector */}
            <div className="relative flex items-center min-w-[170px]">
              <Globe className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none z-10" />
              <select
                value={selectedCountry}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "all") {
                    router.push(`/country/${val.toLowerCase()}`);
                  } else {
                    setSelectedCountry("all");
                  }
                }}
                className="w-full text-xs md:text-sm pl-9 pr-8 py-2 bg-muted/60 hover:bg-muted/80 border border-border/50 rounded-xl font-medium text-foreground cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-accent/50 appearance-none transition-all shadow-2xs"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code} className="bg-card text-foreground py-1">
                    {c.code === "all" ? "🌐 All Regions" : c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none z-10" />
            </div>

            {/* Category Filtering Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full lg:w-auto">
              <TabsList className="flex overflow-x-auto no-scrollbar w-full lg:w-auto justify-start p-1 bg-muted/60 rounded-xl">
                {CATEGORY_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-lg text-xs md:text-sm px-3 py-1.5 font-medium transition-all shrink-0"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Grid Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ArticleSkeletonCard key={i} />
            ))}
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="py-14 px-4 text-center border border-dashed border-border/70 rounded-2xl bg-muted/20 my-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-foreground">Keep looking, we will get it soon!</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Our automated AI news engine is monitoring live global trends 24/7. Fresh breaking stories for this category will be published automatically in the next scheduled run.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {displayedArticles.map((article, index) => (
              <div
                key={article.id}
                className="transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${(index % 5) * 50}ms`
                }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

