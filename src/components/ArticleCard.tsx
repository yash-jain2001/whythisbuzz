'use client';

import { ArticleMetadata } from "@/lib/mdx";
import { proxifyImage } from "@/lib/utils";

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite error loops
  target.alt = "";       // Clear browser's default alt text overlay
  target.src = "/images/placeholder.svg";
}

interface ArticleCardProps {
  article: ArticleMetadata;
  variant?: "default" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const imageSrc = article.imageUrl ? proxifyImage(article.imageUrl) : "/images/placeholder.svg";

  if (variant === "compact") {
    return (
      <a href={`/article/${article.id}`} className="group block">
        <article className="flex gap-4 py-4 border-b border-border/50 last:border-0">
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-900">
            <img
              src={imageSrc}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              {article.category}
            </span>
            <h4 className="font-serif font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {article.title}
            </h4>
            <span className="text-xs text-muted-foreground">{article.readTime}</span>
          </div>
        </article>
      </a>
    );
  }

  return (
    <a href={`/article/${article.id}`} className="group block h-full">
      <article className="h-full bg-card rounded-xl overflow-hidden shadow-editorial card-hover flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="category-tag">{article.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3 flex-1">
          <h3 className="font-serif text-xl font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {article.summary}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2">
            <span>{article.date}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </article>
    </a>
  );
}
