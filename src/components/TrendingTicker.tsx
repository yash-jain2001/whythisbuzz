'use client';

import { useState, useEffect } from 'react';
import { supabase, SupabaseArticleDoc } from '@/lib/supabase';
import { ArticleMetadata } from '@/lib/mdx';

interface TrendingTickerProps {
  initialArticles?: ArticleMetadata[];
}

export function TrendingTicker({ initialArticles = [] }: TrendingTickerProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>(initialArticles.slice(0, 5));

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from('articles')
      .select('slug, title, summary, category, date, read_time')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const allDocs = data as SupabaseArticleDoc[];
          const categorySeen = new Set<string>();
          const diverseList: ArticleMetadata[] = [];

          // Pick 1 article per unique category first
          for (const doc of allDocs) {
            const catNorm = (doc.category || 'General').toLowerCase().replace(/[-_]/g, ' ').trim();
            if (!categorySeen.has(catNorm)) {
              categorySeen.add(catNorm);
              diverseList.push({
                id: doc.slug,
                title: doc.title,
                description: doc.summary || '',
                date: doc.date || '',
                author: 'WhyThisBuzz Desk',
                category: doc.category,
                imageUrl: '',
                readTime: doc.read_time || '3 min read',
                summary: doc.summary || '',
              });
            }
            if (diverseList.length >= 5) break;
          }

          // Backfill if fewer than 5 unique categories were found
          if (diverseList.length < 5) {
            const addedIds = new Set(diverseList.map(item => item.id));
            for (const doc of allDocs) {
              if (diverseList.length >= 5) break;
              if (!addedIds.has(doc.slug)) {
                diverseList.push({
                  id: doc.slug,
                  title: doc.title,
                  description: doc.summary || '',
                  date: doc.date || '',
                  author: 'WhyThisBuzz Desk',
                  category: doc.category,
                  imageUrl: '',
                  readTime: doc.read_time || '3 min read',
                  summary: doc.summary || '',
                });
                addedIds.add(doc.slug);
              }
            }
          }

          setArticles(diverseList);
        }
      });
  }, []);

  if (!articles || articles.length === 0) return null;

  // Repeat items 3 times for a seamless, continuous right-to-left marquee animation
  const tickerItems = [...articles, ...articles, ...articles];

  return (
    <div className="bg-gradient-to-r from-card via-background to-card border-b border-border/80 py-2.5 overflow-hidden">
      <div className="container">
        {/* Moving Marquee Ticker */}
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {tickerItems.map((article, index) => (
              <a
                key={`${article.id}-${index}`}
                href={`/article/${article.id}`}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-foreground/90 hover:text-accent transition-colors group"
              >
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-secondary text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  {article.category}
                </span>
                <span className="truncate max-w-[320px] sm:max-w-[450px]">
                  {article.title}
                </span>
                <span className="text-muted-foreground/40">•</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
