'use client';

import { useState, useEffect } from "react";
import { ArticleCard } from "./ArticleCard";
import { ArticleMetadata } from "@/lib/mdx";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { getRelativeTrendTime } from "@/lib/country-utils";

interface CategorySectionProps {
  id: string;
  title: string;
  description: string;
  articles: ArticleMetadata[];
  viewAllUrl?: string;
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

export function CategorySection({ id, title, description, articles: initialArticles, viewAllUrl }: CategorySectionProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>(initialArticles);

  useEffect(() => {
    if (!supabase) return;

    const catLower = title.toLowerCase().replace(/[-_]/g, ' ').trim();
    let query = supabase
      .from('articles')
      .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .order('created_at', { ascending: false })
      .order('date', { ascending: false });

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
      query = query.ilike('category', `%${title}%`);
    }

    query.limit(8).then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        const results: ArticleMetadata[] = (data as SupabaseArticleDoc[]).map((doc) => ({
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
        setArticles(results);
      } else {
        setArticles([]);
      }
    });
  }, [title]);

  if (!articles || articles.length === 0) {
    return (
      <section id={id} className="scroll-mt-10 py-10 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground max-w-3xl md:max-w-4xl">{description}</p>
            </div>
          </div>

          <div className="py-12 px-4 text-center border border-dashed border-border/70 rounded-2xl bg-muted/20 my-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-foreground">Keep looking, we will get it soon!</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Our automated AI news desk is monitoring live global trends for {title}. Fresh breaking stories will be published automatically in the next scheduled run.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const displayArticles = articles.slice(0, 8);
  const targetUrl = viewAllUrl || `/category/${id}`;

  return (
    <section id={id} className="scroll-mt-10 py-10 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-3xl md:max-w-4xl">{description}</p>
          </div>
          <a
            href={targetUrl}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all shrink-0"
          >
            <span>View all {title.toLowerCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {displayArticles.map((article, index) => (
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

