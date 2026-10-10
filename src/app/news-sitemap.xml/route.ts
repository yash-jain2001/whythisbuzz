import { getAllArticles } from '@/lib/mdx';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes

export async function GET() {
  const articles = await getAllArticles(200);
  const baseUrl = 'https://www.whythisbuzz.com';
  const now = new Date();
  const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

  // Filter for articles from the last 48 hours; if very few, fall back to top 30 most recent
  let recentArticles = articles.filter((article) => {
    const pubDate = new Date(article.metadata.date);
    return !isNaN(pubDate.getTime()) && (now.getTime() - pubDate.getTime() <= FORTY_EIGHT_HOURS);
  });

  if (recentArticles.length < 15) {
    recentArticles = articles.slice(0, 30);
  }

  const escapeXml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const xmlEntries = recentArticles.map((article) => {
    const pubDate = new Date(article.metadata.date);
    const validIsoDate = !isNaN(pubDate.getTime()) ? pubDate.toISOString() : now.toISOString();
    const articleUrl = `${baseUrl}/article/${article.metadata.id}`;
    const cleanTitle = escapeXml(article.metadata.title || 'Trending News');
    const lang = article.metadata.country?.toUpperCase() === 'GB' ? 'en' : 'en';

    return `  <url>
    <loc>${articleUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>WhyThisBuzz</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${validIsoDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
  }).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlEntries}
</urlset>`;

  return new NextResponse(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=1800, stale-while-revalidate',
    },
  });
}
