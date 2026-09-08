import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';
import { MAX_STATIC_ARTICLES } from '@/lib/indexing';

// Revalidate sitemap every hour to automatically pick up new Supabase articles
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.whythisbuzz.com';
    // Fetch all published articles to include every single article in Google Search Console
    const articles = await getAllArticles(MAX_STATIC_ARTICLES);

    // The sitemap is generated as part of the static export.  This means it
    // can only advertise pages generated in the same deployment.
    const now = new Date();
    const articleUrls = articles.map((article) => {
        const lastModified = new Date(article.metadata.date);
        
        // Check if the article was published in the last 60 days
        const isRecent = !Number.isNaN(lastModified.getTime()) && 
            (now.getTime() - lastModified.getTime()) < (60 * 24 * 60 * 60 * 1000);

        return {
            url: `${baseUrl}/article/${article.metadata.id}`,
            // Do not claim that every article changed on every deployment.
            // Google treats lastmod as a trust signal, so omit invalid dates.
            ...(Number.isNaN(lastModified.getTime()) ? {} : { lastModified }),
            changeFrequency: isRecent ? ('hourly' as const) : ('monthly' as const),
            priority: isRecent ? 1.0 : 0.5,
        };
    });

    // Category URLs
    const categories = ['Sports', 'World Affairs', 'Politics', 'Economics', 'Technology', 'Social Media', 'Movies', 'Entertainment'];
    const categoryUrls = categories.map((category) => ({
        url: `${baseUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
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
        { path: '/trending', priority: 0.8 },
    ];

    const staticUrls = staticPages.map((page) => ({
        url: `${baseUrl}${page.path}`,
        changeFrequency: 'monthly' as const,
        priority: page.priority,
    }));

    return [
        {
            url: baseUrl,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...categoryUrls,
        ...articleUrls,
        ...staticUrls,
    ];
}
