import { Navbar } from "@/components/Navbar";
import { ArticleGrid } from "@/components/ArticleGrid";
import { CategorySection } from "@/components/CategorySection";
import { getAllArticles } from "@/lib/mdx";
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
  const allArticles = await getAllArticles();
  const allMetadata = allArticles.map(a => a.metadata);

  // Show first 12 articles in the main grid
  const gridArticles = allMetadata.slice(0, 12);

  // Filter category sections directly from in-memory articles
  const worldAffairsArticles = allMetadata.filter(a => a.category === 'World Affairs');
  const sportsArticles = allMetadata.filter(a => a.category === 'Sports');
  const moviesAndEntertainmentArticles = allMetadata.filter(a =>
    a.category === 'Movies' || a.category === 'Entertainment'
  );
  const socialMediaArticles = allMetadata.filter(a =>
    a.category === 'Social Media' || a.category === 'Social-Media'
  );
  const techArticles = allMetadata.filter(a => a.category === 'Technology');

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
