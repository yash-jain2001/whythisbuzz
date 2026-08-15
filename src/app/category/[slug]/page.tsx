import { Metadata } from 'next';
import { getArticlesByCategory, getAllCategories } from '@/lib/mdx';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
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

    const categoryUrl = `https://whythisbuzz.com/category/${slug}`;
    const description = `Explore all ${categoryName} articles on WhyThisBuzz. Stay updated with the latest trends, news, and insights.`;

    return {
        title: `${categoryName} Articles | WhyThisBuzz`,
        description: description,
        keywords: [categoryName, 'WhyThisBuzz', 'trending news', 'digital culture'],
        alternates: {
            canonical: categoryUrl,
        },
        openGraph: {
            type: 'website',
            url: categoryUrl,
            title: `${categoryName} Articles | WhyThisBuzz`,
            description: description,
            siteName: 'WhyThisBuzz',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${categoryName} Articles | WhyThisBuzz`,
            description: description,
        },
        robots: {
            index: true,
            follow: true,
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
        { name: 'Home', url: 'https://whythisbuzz.com' },
        { name: category, url: `https://whythisbuzz.com/category/${slug}` },
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

                        {/* Articles Grid & 10-Article Pagination */}
                        <CategoryPageClient category={category} slug={slug} initialArticles={articles} />
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
