import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleMetadata } from "@/lib/mdx";

interface HeroSectionProps {
  article: ArticleMetadata;
}

export function HeroSection({ article }: HeroSectionProps) {
  if (!article) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <Link
          href={`/article/${article.id}`}
          className="group block"
        >
          <article className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Image */}
            <div className="relative overflow-hidden rounded-xl aspect-[16/10] md:aspect-[4/3]">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="category-tag">{article.category}</span>
                <span className="text-sm text-muted-foreground">
                  {article.readTime}
                </span>
              </div>

              <h1 className="text-balance group-hover:text-accent transition-colors duration-300">
                {article.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {article.summary}
              </p>

              <div className="flex items-center gap-2 text-accent font-medium mt-2 group-hover:gap-3 transition-all">
                <span>Read the full story</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}
