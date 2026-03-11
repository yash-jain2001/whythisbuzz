import { getAllArticles } from '@/lib/mdx';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
    const articles = getAllArticles();
    const siteUrl = 'https://whythisbuzz.com';
    const siteTitle = 'WhyThisBuzz - Trending News, Digital Culture & Tech Explained';
    const siteDescription = 'Clear explanations of trending topics in technology, movies, entertainment, and digital culture.';

    const feedXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${siteDescription}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${articles.map(article => {
        const articleUrl = `${siteUrl}/article/${article.metadata.id}`;
        return `
    <item>
      <title><![CDATA[${article.metadata.title}]]></title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${new Date(article.metadata.date).toUTCString()}</pubDate>
      <description><![CDATA[${article.metadata.description || article.metadata.summary}]]></description>
      ${article.metadata.category ? `<category><![CDATA[${article.metadata.category}]]></category>` : ''}
      <author><![CDATA[editor@whythisbuzz.com (${article.metadata.author || 'WhyThisBuzz Editorial'})]]></author>
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new NextResponse(feedXml, {
        status: 200,
        headers: {
            'Cache-Control': 's-maxage=1200, stale-while-revalidate',
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
