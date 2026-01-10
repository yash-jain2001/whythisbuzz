import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/mdx';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://whythisbuzz.com'; // Replace with actual domain in production
    const articles = getAllArticles();

    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/article/${article.metadata.id}`,
        lastModified: new Date(article.metadata.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...articleUrls,
    ];
}
