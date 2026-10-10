import { getAllArticles } from '@/lib/mdx';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
    const articles = await getAllArticles();
    const siteUrl = 'https://www.whythisbuzz.com';
    const siteTitle = 'WhyThisBuzz - Trending News, Digital Culture & Tech Explained';
    const siteDescription = 'Clear explanations of trending topics in technology, movies, entertainment, and digital culture.';

    const { getArticleSeoImage } = await import('@/lib/country-utils');

    const feedXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${articles.map(article => {
        const articleUrl = `${siteUrl}/article/${article.metadata.id}`;
        const rawDate = new Date(article.metadata.date);
        const validPubDate = !isNaN(rawDate.getTime()) ? rawDate.toUTCString() : new Date().toUTCString();
        const itemTitle = article.metadata.title || 'Untitled Story';
        const itemSummary = article.metadata.description || article.metadata.summary || '';
        const itemCategory = article.metadata.category || 'General';
        const itemAuthor = article.metadata.author || 'WhyThisBuzz Editorial';
        const seoImage = getArticleSeoImage(article.metadata);

        return `
    <item>
      <title><![CDATA[${itemTitle}]]></title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${validPubDate}</pubDate>
      <description><![CDATA[${itemSummary}]]></description>
      <category><![CDATA[${itemCategory}]]></category>
      <author><![CDATA[editor@whythisbuzz.com (${itemAuthor})]]></author>
      <media:content url="${seoImage}" medium="image" width="1200" height="630" />
      <enclosure url="${seoImage}" type="image/jpeg" length="102400" />
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
