import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';
import { MAX_STATIC_ARTICLES } from '@/lib/indexing';

// Cloudflare Pages serves the exported sitemap file. This must be explicit
// because the site uses Next.js `output: 'export'`.
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://whythisbuzz.com';
    // List only pages generated in this static deployment. Publishing more
    // URLs than Cloudflare Pages can host causes 4xx sitemap entries and
    // eventually makes the deployment fail its 20,000-file limit.
    const articles = await getAllArticles(MAX_STATIC_ARTICLES);

    // The sitemap is generated as part of the static export.  This means it
    // can only advertise pages generated in the same deployment.
    const articleUrls = articles.map((article) => {
        const lastModified = new Date(article.metadata.date);

        return {
            url: `${baseUrl}/article/${article.metadata.id}`,
            // Do not claim that every article changed on every deployment.
            // Google treats lastmod as a trust signal, so omit invalid dates.
            ...(Number.isNaN(lastModified.getTime()) ? {} : { lastModified }),
            changeFrequency: 'daily' as const,
            priority: 0.7,
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
