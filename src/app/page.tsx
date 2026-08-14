import { Navbar } from "@/components/Navbar";
import { ArticleGrid } from "@/components/ArticleGrid";
import { CategorySection } from "@/components/CategorySection";
import { getAllArticles, getArticlesByCategory } from "@/lib/mdx";
import { Metadata } from "next";

import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "WhyThisBuzz - Trending News, Digital Culture & Tech Explained",
  description: "Your daily guide to the internet. We break down complex news, pop culture drama, tech innovations, and global affairs into easy-to-understand stories.",
  keywords: ["trending news", "digital culture", "technology explained", "pop culture", "world affairs", "WhyThisBuzz"],
  openGraph: {
    title: "WhyThisBuzz - Trending News, Digital Culture & Tech Explained",
    description: "Your daily guide to the internet. We break down complex news, pop culture drama, tech innovations, and global affairs into easy-to-understand stories.",
    url: "https://whythisbuzz.com",
    siteName: "WhyThisBuzz",
    type: "website",
  },
};

export default async function Home() {
  const allArticles = await getAllArticles(25);
  const gridArticles = allArticles.map(a => a.metadata);

  const [
    worldAffairsArticles,
    sportsArticles,
    moviesAndEntertainmentArticles,
    socialMediaArticles,
    techArticles
  ] = await Promise.all([
    getArticlesByCategory('World Affairs', 6),
    getArticlesByCategory('Sports', 6),
    getArticlesByCategory('Movies', 6),
    getArticlesByCategory('Social-Media', 6),
    getArticlesByCategory('Technology', 6)
  ]);

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
