import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://whythisbuzz.com';
    const articles = await getAllArticles();
    const currentDate = new Date();

    // Calculate if article is recent (within last 7 days)
    const isRecent = (dateStr: string) => {
        const articleDate = new Date(dateStr);
        const daysDiff = Math.floor((currentDate.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
    };

    // Article URLs with dynamic priorities
    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/article/${article.metadata.id}`,
        lastModified: new Date(article.metadata.date),
        changeFrequency: isRecent(article.metadata.date) ? 'daily' as const : 'weekly' as const,
        priority: isRecent(article.metadata.date) ? 0.9 : 0.8,
    }));

    // Category URLs
    const categories = ['Movies', 'Entertainment', 'Sports', 'Social Media', 'Technology', 'World Affairs', 'Politics', 'Economics'];
    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // Static pages
    const staticPages = [
        { path: '/about', priority: 0.6 },
        { path: '/contact', priority: 0.6 },
        { path: '/privacy', priority: 0.4 },
        { path: '/terms', priority: 0.4 },
        { path: '/disclaimer', priority: 0.4 },
        { path: '/cookies', priority: 0.4 },
    ];

    const staticUrls = staticPages.map((page) => ({
        url: `${baseUrl}${page.path}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: page.priority,
    }));

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...categoryUrls,
        ...articleUrls,
        ...staticUrls,
    ];
}
