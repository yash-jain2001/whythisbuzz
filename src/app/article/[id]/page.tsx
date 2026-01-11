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

    return {
        title: `${article.metadata.title} | WhyThisBuzz`,
        description: article.metadata.summary,
        openGraph: {
            type: 'article',
            title: article.metadata.title,
            description: article.metadata.summary,
            images: [article.metadata.imageUrl],
            publishedTime: new Date(article.metadata.date).toISOString(),
            authors: [article.metadata.author || 'WhyThisBuzz Team'],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.metadata.title,
            description: article.metadata.summary,
            images: [article.metadata.imageUrl],
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

    // Render MDX content
    const content = (
        <MDXRemote source={article.content} components={{ Image }} />
    );

    // Transform article for view component (adapting structure)
    const articleForView = {
        ...article.metadata,
        content: content, // Passing ReactNode content instead of structured object
    };

    return <ArticleView article={articleForView as any} relatedArticles={relatedArticles as any} />;
}
