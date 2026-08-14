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
    let query = supabase
      .from('articles')
      .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords, created_at')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (catLower.includes('social')) {
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

    query.limit(8).then(async ({ data, error }) => {
      let results: ArticleMetadata[] = [];
      if (!error && data && data.length > 0) {
        results = (data as SupabaseArticleDoc[]).map((doc) => ({
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
      }

      if (results.length < 8 && supabase) {
        const { data: allData } = await supabase
          .from('articles')
          .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords, created_at')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20);

        if (allData) {
          const existingSlugs = new Set(results.map(r => r.id));
          for (const doc of allData) {
            if (results.length >= 8) break;
            if (!existingSlugs.has(doc.slug)) {
              results.push({
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
              });
              existingSlugs.add(doc.slug);
            }
          }
        }
      }

      if (results.length > 0) {
        setArticles(results.slice(0, 8));
      }
    });
  }, [title]);

  if (!articles || articles.length === 0) return null;
  const displayArticles = articles.slice(0, 8);
  const targetUrl = viewAllUrl || `/category/${id}`;

  return (
    <section id={id} className="scroll-mt-10 py-10 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
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

