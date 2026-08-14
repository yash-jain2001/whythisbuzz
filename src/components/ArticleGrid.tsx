'use client';

import { useState, useEffect } from "react";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeletonCard } from "./ArticleSkeletonCard";
import { ArticleMetadata } from "@/lib/mdx";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  { id: "all", label: "All Trending" },
  { id: "sports", label: "Sports" },
  { id: "world", label: "World Affairs" },
  { id: "tech", label: "Technology" },
  { id: "social", label: "Social Media" },
  { id: "movies", label: "Movies & Ent." },
];

export function ArticleGrid({ articles: initialArticles }: ArticleGridProps) {
  const [allArticles, setAllArticles] = useState<ArticleMetadata[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from('articles')
      .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30)
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
          }));
          setAllArticles(liveArticles);
        }
        setIsLoading(false);
      });
  }, []);

  const filteredArticles = allArticles.filter((article) => {
    if (selectedCategory === "all") return true;
    const catLower = article.category.toLowerCase();
    if (selectedCategory === "sports") return catLower.includes("sport");
    if (selectedCategory === "world") return catLower.includes("world");
    if (selectedCategory === "tech") return catLower.includes("tech");
    if (selectedCategory === "social") return catLower.includes("social");
    if (selectedCategory === "movies") return catLower.includes("movie") || catLower.includes("entertain");
    return true;
  }).slice(0, 20);

  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Trending Now</h2>
          
          {/* Category Filtering Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
            <TabsList className="flex overflow-x-auto no-scrollbar w-full md:w-auto justify-start p-1 bg-muted/60 rounded-xl">
              {CATEGORY_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-lg text-xs md:text-sm px-3 py-1.5 font-medium transition-all"
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
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

