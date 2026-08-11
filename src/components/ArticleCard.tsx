'use client';

import { ArticleMetadata } from "@/lib/mdx";
import { proxifyImage } from "@/lib/utils";

const DEMO_IMAGES: Record<string, string> = {
  "Sports": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
  "Entertainment": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "World Affairs": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "Movies": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  "Social Media": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
  "Social-Media": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
};

function getDemoImage(category: string): string {
  const catLower = (category || '').toLowerCase().trim();
  const matchedKey = Object.keys(DEMO_IMAGES).find(k => 
    k.toLowerCase() === catLower || catLower.includes(k.toLowerCase()) || k.toLowerCase().includes(catLower)
  );
  return matchedKey ? DEMO_IMAGES[matchedKey] : DEMO_IMAGES["World Affairs"];
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, category: string) {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite error loops
  target.alt = "";       // Clear browser default text overlay
  target.src = getDemoImage(category); // Load vibrant HD category demo photo
}

interface ArticleCardProps {
  article: ArticleMetadata;
  variant?: "default" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const proxified = article.imageUrl ? proxifyImage(article.imageUrl) : '';
  const imageSrc = proxified || getDemoImage(article.category);

  if (variant === "compact") {
    return (
      <a href={`/article/${article.id}`} className="group block">
        <article className="flex gap-4 py-4 border-b border-border/50 last:border-0">
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <img
              src={imageSrc}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => handleImageError(e, article.category)}
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
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => handleImageError(e, article.category)}
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
