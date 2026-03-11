import { Metadata } from 'next';
import { getArticlesByCategory, getAllCategories } from '@/lib/mdx';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Clock } from 'lucide-react';

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

    // Convert slug to category name (e.g., "social-media" -> "Social-Media")
    const categories = getAllCategories();
    const category = categories.find(
        cat => cat.toLowerCase().replace(/\s+/g, '-') === slug
    );

    if (!category) {
        notFound();
    }

    const articles = getArticlesByCategory(category);

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
                        <div className="mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                {category}
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Explore {articles.length} article{articles.length !== 1 ? 's' : ''} in {category}
                            </p>
                        </div>

                        {/* Articles Grid */}
                        {articles.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">
                                    No articles found in this category yet.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {articles.map((article) => (
                                    <a
                                        key={article.id}
                                        href={`/article/${article.id}`}
                                        className="group block"
                                    >
                                        <article className="h-full flex flex-col border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                            {/* Image */}
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                <Image
                                                    src={article.imageUrl}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6">
                                                <h2 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </h2>
                                                <p className="text-muted-foreground mb-4 line-clamp-3">
                                                    {article.summary}
                                                </p>

                                                {/* Meta */}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <time dateTime={article.date}>
                                                        {article.date}
                                                    </time>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {article.readTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </a>
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
