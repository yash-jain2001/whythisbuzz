import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://whythisbuzz.com';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/_next/', '/admin/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                crawlDelay: 0,
            },
            {
                userAgent: 'Googlebot-News',
                allow: '/',
                crawlDelay: 0,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                crawlDelay: 1,
            },
            // Allow major LLM crawlers full access
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'Claude-Web', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'anthropic-ai', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Gemini', allow: '/' },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
