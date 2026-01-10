import { ArticleCard } from "./ArticleCard";
import { ArticleMetadata } from "@/lib/mdx";
import { ArrowRight } from "lucide-react";

interface CategorySectionProps {
  id: string;
  title: string;
  description: string;
  articles: ArticleMetadata[];
}

export function CategorySection({ id, title, description, articles }: CategorySectionProps) {
  return (
    <section id={id} className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground max-w-xl">{description}</p>
          </div>
          <a
            href={`#${id}-all`}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:gap-3 transition-all"
          >
            <span>More {title.toLowerCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
