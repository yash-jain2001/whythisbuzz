'use client';

import { useState } from "react";
import Link from "next/link";
import { ArticleMetadata } from "@/lib/mdx";
import { proxifyImage } from "@/lib/utils";
import { getRelativeTrendTime, getCategoryFallbackBanner } from "@/lib/country-utils";
import { TrendingUp, Clock } from "lucide-react";

interface ArticleCardProps {
  article: ArticleMetadata;
  variant?: "default" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const isBadImage = !article.imageUrl || 
    article.imageUrl.trim() === "" || 
    article.imageUrl.includes('placeholder') || 
    article.imageUrl.includes('photo-1611162617474-5b21e879e113') ||
    article.imageUrl.includes('photo-1540910419892-4a36d2c3266c') ||
    article.imageUrl.includes('photo-1518770660439') ||
    article.imageUrl.includes('photo-1611974789855') ||
    article.imageUrl.includes('photo-1529107386315') ||
    article.imageUrl.includes('photo-1514525253161') ||
    article.imageUrl.includes('photo-1461896836934');

  const categoryFallback = getCategoryFallbackBanner(article.category, article.title);
  const targetSrc = isBadImage ? categoryFallback : (proxifyImage(article.imageUrl) || categoryFallback);
  
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = (failedUrl === targetSrc) ? categoryFallback : targetSrc;

  const trendOriginTime = article.trendTime || getRelativeTrendTime(article.date);

  const handleImageError = () => {
    setFailedUrl(targetSrc);
    setIsLoaded(true);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  if (variant === "compact") {
    return (
      <div className="group block">
        <article className="flex gap-4 py-4 border-b border-border/50 last:border-0 relative">
          <Link href={`/article/${article.id}`} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted relative shimmer-wave">
            {!isLoaded && (
              <div className="absolute inset-0 bg-muted shimmer-wave z-10" />
            )}
            <img
              src={imageSrc}
              alt={article.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </Link>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-accent">
              <span>{article.category}</span>
            </div>
            <Link href={`/article/${article.id}`} className="font-serif font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
              <span>{trendOriginTime}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <article className="h-full bg-card rounded-xl overflow-hidden shadow-editorial card-hover flex flex-col group">
      {/* Image Link */}
      <Link href={`/article/${article.id}`} className="relative aspect-[16/10] overflow-hidden bg-muted block">
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted shimmer-wave z-10" />
        )}
        <img
          src={imageSrc}
          alt={article.title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute top-3 left-3 z-20">
          <span className="category-tag">{article.category}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-4.5 flex flex-col gap-2 flex-1">
        {/* Title Link */}
        <Link href={`/article/${article.id}`}>
          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>
        </Link>

        {/* Summary Link */}
        <Link href={`/article/${article.id}`}>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </Link>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/40">
          <div className="flex items-center gap-1 font-medium text-accent">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{trendOriginTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground/60" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

