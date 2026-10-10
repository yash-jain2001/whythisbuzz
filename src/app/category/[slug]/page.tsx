import { Metadata } from 'next';
import { getArticlesByCategory, getAllCategories } from '@/lib/mdx';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { CategoryPageClient } from './CategoryPageClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const categories = getAllCategories();
    return categories.map((category) => ({
        slug: category.toLowerCase().replace(/\s+/g, '-'),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const categoryName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const categoryUrl = `https://www.whythisbuzz.com/category/${slug}`;
    const description = `Explore all ${categoryName} articles on WhyThisBuzz. Stay updated with the latest trends, news, and insights.`;

    return {
        title: `${categoryName} Articles | WhyThisBuzz`,
        description: description,
        keywords: [categoryName, 'WhyThisBuzz', 'trending news', 'digital culture'],
        alternates: {
            canonical: categoryUrl,
            languages: {
                'en': categoryUrl,
                'en-US': categoryUrl,
                'en-GB': categoryUrl,
                'x-default': categoryUrl,
            },
        },
        openGraph: {
            type: 'website',
            url: categoryUrl,
            title: `${categoryName} Articles | WhyThisBuzz`,
            description: description,
            siteName: 'WhyThisBuzz',
            locale: 'en_US',
            images: [
                {
                    url: 'https://www.whythisbuzz.com/images/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${categoryName} Articles - WhyThisBuzz`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${categoryName} Articles | WhyThisBuzz`,
            description: description,
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
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;

    const categoryMap: Record<string, string> = {
        'sports': 'Sports',
        'world-affairs': 'World Affairs',
        'politics': 'Politics',
        'economics': 'Economics',
        'technology': 'Technology',
        'social-media': 'Social Media',
        'movies': 'Movies',
        'entertainment': 'Entertainment',
        'movies-entertainment': 'Movies & Entertainment'
    };

    const categories = getAllCategories();
    const matchedCategory = categories.find(
        cat => cat.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );

    const category = matchedCategory || categoryMap[slug.toLowerCase()] || slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const articles = await getArticlesByCategory(category, 1000);

    // Generate structured data
    const { generateBreadcrumbSchema, generateCollectionPageSchema, generateJsonLd, generateCombinedSchema } = await import('@/lib/structured-data');
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://www.whythisbuzz.com' },
        { name: category, url: `https://www.whythisbuzz.com/category/${slug}` },
    ]);
    const collectionSchema = generateCollectionPageSchema(category, articles.length);
    const combinedSchema = generateCombinedSchema(breadcrumbSchema, collectionSchema);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateJsonLd(combinedSchema) }}
            />

            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8 max-w-7xl">
                        {/* Breadcrumb */}
                        <Breadcrumb
                            items={[
                                { name: category, url: `/category/${slug}` }
                            ]}
                        />

                        {/* Category Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">
                                {category}
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground">
                                Explore all breaking news and trending topics in {category}.
                            </p>
                        </div>

                        {/* Articles Grid & 10-Article Crawlable Pagination */}
                        <CategoryPageClient category={category} slug={slug} initialArticles={articles} />

                        {/* Complete Category Story Directory for Search Engine Crawlers & Full Indexation */}
                        {articles.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-border">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                    <h2 className="text-xl font-serif font-bold text-foreground">
                                        Complete {category} Directory
                                    </h2>
                                    <span className="text-xs text-muted-foreground font-mono bg-secondary px-2.5 py-1 rounded-full border border-border/60 self-start sm:self-auto">
                                        {articles.length} Stories Indexed
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-6">
                                    Crawlable index of all published {category} analyses, breaking coverage, and trending explainers.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                                    {articles.map((art) => (
                                        <Link
                                            key={art.id}
                                            href={`/article/${art.id}`}
                                            className="text-muted-foreground hover:text-accent transition-colors truncate py-1.5 border-b border-border/30 hover:border-accent/40 flex items-center justify-between gap-3 group"
                                            title={art.title}
                                        >
                                            <span className="truncate group-hover:text-foreground">{art.title}</span>
                                            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0 font-mono">{art.date}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
