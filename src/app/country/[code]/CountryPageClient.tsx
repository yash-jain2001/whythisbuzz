'use client';

import { useState, useEffect, useRef } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleSkeletonCard } from "@/components/ArticleSkeletonCard";
import { ArticleMetadata } from "@/lib/mdx";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { getCountryForArticle, getRelativeTrendTime } from "@/lib/country-utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface CountryPageClientProps {
  countryCode: string;
  countryName: string;
  initialArticles: ArticleMetadata[];
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

const ITEMS_PER_PAGE = 10;

export function CountryPageClient({ countryCode, countryName, initialArticles }: CountryPageClientProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(initialArticles.length === 0);
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLElement | null>(null);

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
          const matchedDocs = (data as SupabaseArticleDoc[]).filter((doc) => {
            const countryInfo = getCountryForArticle(doc.geo, doc.title, doc.summary);
            return countryInfo.code.toUpperCase() === countryCode.toUpperCase();
          });

          // Sort strictly by newest creation time / date descending (newest trends first)
          matchedDocs.sort((a, b) => {
            const timeA = new Date(a.created_at || a.date).getTime();
            const timeB = new Date(b.created_at || b.date).getTime();
            return timeB - timeA;
          });

          const liveArticles: ArticleMetadata[] = matchedDocs.map((doc) => ({
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

          setArticles(liveArticles.length > 0 ? liveArticles : initialArticles);
        } else {
          setArticles(initialArticles);
        }
        setIsLoading(false);
      });
  }, [countryCode, initialArticles]);

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory === "all") return true;
    const catLower = article.category.toLowerCase();
    if (selectedCategory === "sports") return catLower.includes("sport");
    if (selectedCategory === "world") return catLower.includes("world");
    if (selectedCategory === "politics") return catLower.includes("politic");
    if (selectedCategory === "economics") return catLower.includes("economic") || catLower.includes("finance");
    if (selectedCategory === "tech") return catLower.includes("tech");
    if (selectedCategory === "social") return catLower.includes("social") || catLower.includes("media") || catLower.includes("viral") || catLower.includes("internet");
    if (selectedCategory === "movies") return catLower.includes("movie") || catLower.includes("entertain");
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section ref={sectionRef}>
      {/* Category Tabs & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4 text-accent" />
          <span>{filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'} Found</span>
        </div>

        <Tabs 
          value={selectedCategory} 
          onValueChange={(val) => {
            setSelectedCategory(val);
            setCurrentPage(1);
          }} 
          className="w-full sm:w-auto"
        >
          <TabsList className="flex overflow-x-auto no-scrollbar w-full sm:w-auto justify-start p-1 bg-muted/60 rounded-xl">
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

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ArticleSkeletonCard key={i} />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-16 px-4 text-center border border-dashed border-border/70 rounded-2xl bg-muted/20 my-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-foreground">Keep looking, we will get it soon!</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Our automated AI news engine is monitoring live global trends for {countryName} 24/7. Fresh breaking stories for this category will be published automatically in the next scheduled run.
          </p>
        </div>
      ) : (
        <>
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

          {/* 10-Article Pagination Controls */}
          {totalPages > 1 && (
            <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 mt-8">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to{" "}
                <span className="text-foreground font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)}</span> of{" "}
                <span className="text-foreground font-semibold">{filteredArticles.length}</span> articles
              </p>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-xs font-bold"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
