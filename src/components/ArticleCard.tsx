'use client';

import { useState } from "react";
import Link from "next/link";
import { ArticleMetadata } from "@/lib/mdx";
import { proxifyImage } from "@/lib/utils";
import { getCountryForArticle, getRelativeTrendTime, getFlagImageUrl } from "@/lib/country-utils";
import { TrendingUp, Clock } from "lucide-react";

const DEFAULT_THUMBNAIL = "/images/default-thumbnail.png";

interface ArticleCardProps {
  article: ArticleMetadata;
  variant?: "default" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const isBadImage = !article.imageUrl || article.imageUrl.includes('photo-1611162617474-5b21e879e113') || article.imageUrl.includes('placeholder');
  const targetSrc = isBadImage ? DEFAULT_THUMBNAIL : (proxifyImage(article.imageUrl) || DEFAULT_THUMBNAIL);
  
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = (failedUrl === targetSrc) ? DEFAULT_THUMBNAIL : targetSrc;

  const countryInfo = getCountryForArticle(article.country, article.title, article.summary);
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
      <a href={`/article/${article.id}`} className="group block">
        <article className="flex gap-4 py-4 border-b border-border/50 last:border-0">
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted relative shimmer-wave">
            {!isLoaded && (
              <div className="absolute inset-0 bg-muted shimmer-wave z-10" />
            )}
            <img
              src={imageSrc}
              alt=""
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-accent">
              <span>{article.category}</span>
              <span>•</span>
              <div className="inline-flex items-center gap-1">
                <img
                  src={getFlagImageUrl(countryInfo.code)}
                  alt={countryInfo.name}
                  className="w-3.5 h-2.5 object-cover rounded-[2px]"
                />
                <span>{countryInfo.name}</span>
              </div>
            </div>
            <h4 className="font-serif font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
              <span>{trendOriginTime}</span>
              <span>•</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </article>
      </a>
    );
  }

  return (
    <a href={`/article/${article.id}`} className="group block h-full">
      <article className="h-full bg-card rounded-xl overflow-hidden shadow-editorial card-hover flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {!isLoaded && (
            <div className="absolute inset-0 bg-muted shimmer-wave z-10" />
          )}
          <img
            src={imageSrc}
            alt=""
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute top-3 left-3 z-20">
            <span className="category-tag">{article.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-4.5 flex flex-col gap-2 flex-1">
          {/* Country Origin Indicator */}
          <Link 
            href={`/country/${countryInfo.code.toLowerCase()}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors w-fit group/country"
          >
            <img
              src={getFlagImageUrl(countryInfo.code)}
              alt={countryInfo.name}
              className="w-4 h-3 object-cover rounded-[2px] shadow-xs group-hover/country:scale-105 transition-transform"
            />
            <span className="uppercase tracking-wider text-[11px] font-sans font-semibold text-muted-foreground/80 group-hover/country:text-accent transition-colors">{countryInfo.name}</span>
          </Link>

          <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>

          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
            {article.summary}
          </p>

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
    </a>
  );
}

