'use client';

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleSkeletonCard } from "@/components/ArticleSkeletonCard";
import { ArticleMetadata } from "@/lib/mdx";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { getRelativeTrendTime } from "@/lib/country-utils";
import { Sparkles, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryPageClientProps {
  category: string;
  slug: string;
  initialArticles: ArticleMetadata[];
}

const ITEMS_PER_PAGE = 10;

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
}

function CategoryPageContent({ category, slug, initialArticles }: CategoryPageClientProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>(initialArticles || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialArticles || initialArticles.length === 0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const catLower = category.toLowerCase().replace(/[-_]/g, ' ').trim();

    let query = supabase
      .from('articles')
      .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .order('created_at', { ascending: false })
      .order('date', { ascending: false })
      .limit(1000);

    if (catLower.includes('politic')) {
      query = query.ilike('category', '%Politic%');
    } else if (catLower.includes('economic') || catLower.includes('finance')) {
      query = query.or('category.ilike.%Economic%,category.ilike.%Finance%');
    } else if (catLower.includes('social')) {
      query = query.ilike('category', '%Social%');
    } else if (catLower.includes('tech')) {
      query = query.ilike('category', '%Tech%');
    } else if (catLower.includes('sport')) {
      query = query.ilike('category', '%Sport%');
    } else if (catLower.includes('movie') || catLower.includes('entertain')) {
      query = query.or('category.ilike.%Movie%,category.ilike.%Entertain%');
    } else if (catLower.includes('world')) {
      query = query.ilike('category', '%World%');
    } else {
      query = query.ilike('category', `%${category}%`);
    }

    query.then(({ data, error }) => {
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
          trendTime: getRelativeTrendTime(doc.date, doc.created_at),
        }));

        setArticles(liveArticles);
      }
      setIsLoading(false);
    });
  }, [category]);

  const totalPages = Math.max(1, Math.ceil(articles.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const displayedArticles = articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getPageUrl = (pageNum: number) => {
    if (pageNum <= 1) return `/category/${slug}`;
    return `/category/${slug}?page=${pageNum}`;
  };

  return (
    <section ref={sectionRef}>
      {/* Category Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4 text-accent" />
          <span>{articles.length} {articles.length === 1 ? 'Article' : 'Articles'} Found in {category}</span>
        </div>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ArticleSkeletonCard key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 px-4 text-center border border-dashed border-border/70 rounded-2xl bg-muted/20 my-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-foreground">Keep looking, we will get it soon!</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Our automated AI news desk is monitoring live global trends for {category}. Fresh breaking stories will be published automatically in the next scheduled run.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedArticles.map((article, index) => (
              <div
                key={article.id}
                className="transition-all duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${(index % 4) * 50}ms`
                }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          {/* Crawlable HTML Link Pagination Controls */}
          {totalPages > 1 && (
            <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 mt-8">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to{" "}
                <span className="text-foreground font-semibold">{Math.min(startIndex + ITEMS_PER_PAGE, articles.length)}</span> of{" "}
                <span className="text-foreground font-semibold">{articles.length}</span> articles
              </p>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Previous Button Link */}
                {validCurrentPage > 1 ? (
                  <Link
                    href={getPageUrl(validCurrentPage - 1)}
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 hover:bg-muted text-foreground"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium opacity-40 cursor-not-allowed flex items-center gap-1 text-muted-foreground">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </span>
                )}

                {/* Page Number Links */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <Link
                      key={pageNum}
                      href={getPageUrl(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-xs font-bold"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {/* Next Button Link */}
                {validCurrentPage < totalPages ? (
                  <Link
                    href={getPageUrl(validCurrentPage + 1)}
                    className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 hover:bg-muted text-foreground"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg border border-border/60 text-xs sm:text-sm font-medium opacity-40 cursor-not-allowed flex items-center gap-1 text-muted-foreground">
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function CategoryPageClient(props: CategoryPageClientProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ArticleSkeletonCard key={i} />
        ))}
      </div>
    }>
      <CategoryPageContent {...props} />
    </Suspense>
  );
}
