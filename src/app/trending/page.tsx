import { Metadata } from 'next';
import { getAllArticles } from '@/lib/mdx';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';

export const metadata: Metadata = {
  title: 'Trending News & Articles | WhyThisBuzz',
  description: 'Explore all trending news, viral stories, technology breakthroughs, and global affairs on WhyThisBuzz.',
  keywords: ['trending news', 'viral news', 'digital culture', 'WhyThisBuzz', 'technology', 'world affairs'],
  alternates: {
    canonical: 'https://www.whythisbuzz.com/trending',
    languages: {
      'en': 'https://www.whythisbuzz.com/trending',
      'en-US': 'https://www.whythisbuzz.com/trending',
      'en-GB': 'https://www.whythisbuzz.com/trending',
      'x-default': 'https://www.whythisbuzz.com/trending',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.whythisbuzz.com/trending',
    title: 'Trending News & Articles | WhyThisBuzz',
    description: 'Explore all trending news, viral stories, technology breakthroughs, and global affairs on WhyThisBuzz.',
    siteName: 'WhyThisBuzz',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.whythisbuzz.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Trending News & Articles - WhyThisBuzz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending News & Articles | WhyThisBuzz',
    description: 'Explore all trending news, viral stories, technology breakthroughs, and global affairs on WhyThisBuzz.',
    images: ['https://www.whythisbuzz.com/images/og-image.jpg'],
    site: '@whythisbuzz',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default async function TrendingPage() {
  const articles = await getAllArticles(100);

  const { generateBreadcrumbSchema, generateCollectionPageSchema, generateJsonLd, generateCombinedSchema } = await import('@/lib/structured-data');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://www.whythisbuzz.com' },
    { name: 'Trending Now', url: 'https://www.whythisbuzz.com/trending' },
  ]);
  const collectionSchema = generateCollectionPageSchema('Trending Now', articles.length);
  const combinedSchema = generateCombinedSchema(breadcrumbSchema, collectionSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateJsonLd(combinedSchema) }}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Breadcrumb
              items={[
                { name: 'Trending Now', url: '/trending' }
              ]}
            />

            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                Trending Now
              </h1>
              <p className="text-lg text-muted-foreground">
                All latest stories, viral news, and in-depth trend explanations on WhyThisBuzz ({articles.length} stories).
              </p>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No articles available right now. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {articles.map((article) => (
                  <ArticleCard key={article.metadata.id} article={article.metadata} />
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
