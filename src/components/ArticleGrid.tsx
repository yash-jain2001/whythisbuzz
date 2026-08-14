'use client';

import { useState, useEffect } from "react";
import { ArticleCard } from "./ArticleCard";
import { ArticleMetadata } from "@/lib/mdx";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";

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

export function ArticleGrid({ articles: initialArticles }: ArticleGridProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>(initialArticles);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from('articles')
      .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(25)
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
          setArticles(liveArticles);
        }
      });
  }, []);

  return (
    <section className="py-8 md:py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Trending Now</h2>
          <a
            href="/trending"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

