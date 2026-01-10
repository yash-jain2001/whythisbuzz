import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ArticleGrid } from "@/components/ArticleGrid";
import { CategorySection } from "@/components/CategorySection";
import { getArticlesByCategory, getAllArticles } from "@/lib/mdx";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  const allArticles = getAllArticles();

  // For Hero, pick specifically the Dune article or the first one
  const featuredArticle = allArticles.find(a => a.metadata.id === 'dune-3-announcement')?.metadata || allArticles[0]?.metadata;

  // For "Latest Explained", maybe just the most recent 6 articles excluding the featured one?
  // Or stick to the specific list if they were important, but dynamic is better.
  const latestArticles = allArticles
    .filter(a => a.metadata.id !== featuredArticle?.id)
    .slice(0, 6)
    .map(a => a.metadata);

  const moviesArticles = getArticlesByCategory("Movies");
  const socialMediaArticles = getArticlesByCategory("Social Media");
  const techArticles = getArticlesByCategory("Technology");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {featuredArticle && <HeroSection article={featuredArticle} />}

        <ArticleGrid articles={latestArticles} />

        <CategorySection
          id="movies"
          title="Movies & Entertainment"
          description="Box office trends, industry drama, and everything cinema—explained without the hype."
          articles={moviesArticles}
        />

        <CategorySection
          id="social-media"
          title="Social Media"
          description="Platform updates, viral moments, and digital culture decoded for everyone."
          articles={socialMediaArticles}
        />

        <CategorySection
          id="technology"
          title="Technology"
          description="The latest in AI, frameworks, and developer tools."
          articles={techArticles}
        />

        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
