import { Navbar } from "@/components/Navbar";
import { ArticleGrid } from "@/components/ArticleGrid";
import { CategorySection } from "@/components/CategorySection";
import { getArticlesByCategory, getAllArticles } from "@/lib/mdx";

import { Footer } from "@/components/Footer";

export default function Home() {
  const allArticles = getAllArticles();

  // Show first 12 articles in the main grid (equal weight, no hero)
  const gridArticles = allArticles
    .slice(0, 12)
    .map(a => a.metadata);

  const moviesArticles = getArticlesByCategory("Movies");
  const entertainmentArticles = getArticlesByCategory("Entertainment");
  const socialMediaArticles = getArticlesByCategory("Social Media");
  const techArticles = getArticlesByCategory("Technology");
  const sportsArticles = getArticlesByCategory("Sports");
  const worldAffairsArticles = getArticlesByCategory("World Affairs");

  // Combine Movies and Entertainment
  const moviesAndEntertainmentArticles = [...moviesArticles, ...entertainmentArticles].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <ArticleGrid articles={gridArticles} />

        <CategorySection
          id="world-affairs"
          title="World Affairs"
          description="Global events, politics, and international relations explained clearly."
          articles={worldAffairsArticles}
        />

        <CategorySection
          id="sports"
          title="Sports"
          description="Analysis, highlights, and deep dives into the world of sports."
          articles={sportsArticles}
        />

        <CategorySection
          id="movies"
          title="Movies & Entertainment"
          description="Box office trends, industry drama, and everything cinema - explained without the hype."
          articles={moviesAndEntertainmentArticles}
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


      </main>

      <Footer />
    </div>
  );
}
