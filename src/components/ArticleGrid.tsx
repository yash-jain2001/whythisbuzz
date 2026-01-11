import { ArticleCard } from "./ArticleCard";
import { ArticleMetadata } from "@/lib/mdx";

interface ArticleGridProps {
  articles: ArticleMetadata[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">Trending Now</h2>
          <a
            href="#all"
            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View all →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
