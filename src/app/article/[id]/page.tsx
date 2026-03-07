import { Metadata } from 'next';
import { getArticleBySlug, getRelatedArticles, getArticleSlugs } from '@/lib/mdx'; // Updated import
import Image from 'next/image';
import { ArticleView } from '@/components/ArticleView';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const { generateSearchData } = await import('@/lib/searchData');
    generateSearchData(); // Generate search data during build

    const slugs = getArticleSlugs();
    return slugs.map((slug) => ({
        id: slug.replace(/\.mdx$/, ''),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;

    // Fetch article by ID (slug)
    const article = getArticleBySlug(id);

    if (!article) {
        return {
            title: 'Article Not Found | WhyThisBuzz',
        };
    }

    const articleUrl = `https://whythisbuzz.com/article/${article.metadata.id}`;
    
    // Explicitly use the generated SEO description if available, fallback to the article summary
    const description = article.metadata.metaDescription || article.metadata.summary;
    
    // Explicitly use the generated SEO title if available, fallback to the article title
    const seoTitle = article.metadata.seoTitle ? `${article.metadata.seoTitle} | WhyThisBuzz` : `${article.metadata.title} | WhyThisBuzz`;
    
    // Combine generated keywords with base keywords
    const keywordsList = article.metadata.keywords 
        ? article.metadata.keywords.split(',').map(k => k.trim()) 
        : [];
        
    const category = article.metadata.category || 'General';
    const title = article.metadata.title || 'Untitled';

    const finalKeywords = [
        category,
        'WhyThisBuzz',
        'trending news',
        'digital culture',
        title.toLowerCase(),
        ...keywordsList
    ];

    return {
        title: seoTitle,
        description: description,
        keywords: finalKeywords,
        authors: [{ name: article.metadata.author || 'WhyThisBuzz Editorial' }],
        creator: 'WhyThisBuzz',
        publisher: 'WhyThisBuzz',
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            type: 'article',
            url: articleUrl,
            title: article.metadata.seoTitle || article.metadata.title,
            description: description,
            images: [
                {
                    url: article.metadata.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: article.metadata.title,
                },
            ],
            publishedTime: new Date(article.metadata.date).toISOString(),
            modifiedTime: new Date(article.metadata.date).toISOString(),
            authors: [article.metadata.author || 'WhyThisBuzz Editorial'],
            section: article.metadata.category,
            tags: [article.metadata.category],
            siteName: 'WhyThisBuzz',
            locale: 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: article.metadata.title,
            description: description,
            images: [article.metadata.imageUrl],
            creator: '@whythisbuzz',
            site: '@whythisbuzz',
        },
        robots: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { id } = await params;

    const article = getArticleBySlug(id);

    if (!article) {
        notFound();
    }

    const relatedArticles = getRelatedArticles(article.metadata.id);

    // Import structured data utilities
    const { generateArticleSchema, generateBreadcrumbSchema, generateJsonLd } = await import('@/lib/structured-data');

    // Generate structured data
    const articleSchema = generateArticleSchema(article.metadata, article.content);
    const category = article.metadata.category || 'General';
    const title = article.metadata.title || 'Untitled';

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://whythisbuzz.com' },
        { name: category, url: `https://whythisbuzz.com/category/${category.toLowerCase().replace(/\s+/g, '-')}` },
        { name: title, url: `https://whythisbuzz.com/article/${article.metadata.id}` },
    ]);

    // Render MDX content
    const content = (
        <MDXRemote source={article.content} components={{ Image }} />
    );

    // Transform article for view component (adapting structure)
    const articleForView = {
        ...article.metadata,
        content: content, // Passing ReactNode content instead of structured object
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateJsonLd(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateJsonLd(breadcrumbSchema) }}
            />

            <ArticleView article={articleForView} relatedArticles={relatedArticles} />
        </>
    );
}
