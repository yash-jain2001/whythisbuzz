'use client';

import { useState, useEffect } from "react";
import { ArticleCard } from "./ArticleCard";
import { ArticleMetadata } from "@/lib/mdx";
import { ArrowRight } from "lucide-react";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";

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
    let catQuery = title;
    if (catLower.includes('social')) {
      catQuery = 'Social';
    } else if (catLower.includes('tech')) {
      catQuery = 'Technology';
    } else if (catLower.includes('sport')) {
      catQuery = 'Sports';
    } else if (catLower.includes('movie') || catLower.includes('entertain')) {
      catQuery = 'Movie';
    } else if (catLower.includes('world')) {
      catQuery = 'World';
    }

    supabase
      .from('articles')
      .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .ilike('category', `%${catQuery}%`)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)
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
  }, [title]);

  if (!articles || articles.length === 0) return null;
  const displayArticles = articles.slice(0, 6);
  const targetUrl = viewAllUrl || `/category/${id}`;

  return (
    <section id={id} className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-xl">{description}</p>
          </div>
          <a
            href={targetUrl}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all shrink-0"
          >
            <span>View all {title.toLowerCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

