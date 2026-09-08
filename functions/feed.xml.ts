export async function onRequest(context: { env?: Record<string, string> }): Promise<Response> {
    const siteUrl = 'https://www.whythisbuzz.com';
    const siteTitle = 'WhyThisBuzz - Trending News, Digital Culture & Tech Explained';
    const siteDescription = 'Clear explanations of trending topics in technology, movies, entertainment, and digital culture.';

    const env = context.env || {};
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://duqkblgwbydqhmlmcfxp.supabase.co';
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cWtibGd3YnlkcWhtbG1jZnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODEwMjcsImV4cCI6MjEwMTk1NzAyN30.rXZrpHV_5qG3_FI7Ny5bLrNKkWZEgiNSbv9-gqOn8Vc';

    let articles: Array<{ slug: string; title?: string; summary?: string; meta_description?: string; category?: string; author?: string; date?: string }> = [];

    try {
        const res = await fetch(
            `${supabaseUrl}/rest/v1/articles?select=slug,title,summary,meta_description,category,author,date&order=created_at.desc&order=date.desc&limit=50`,
            {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                }
            }
        );

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                articles = data;
            }
        }
    } catch (e) {
        console.error('Error fetching articles for dynamic RSS feed:', e);
    }

    const itemsXml = articles.map(article => {
        const articleUrl = `${siteUrl}/article/${article.slug}`;
        const rawDate = article.date ? new Date(article.date) : new Date();
        const validPubDate = !isNaN(rawDate.getTime()) ? rawDate.toUTCString() : new Date().toUTCString();
        const itemTitle = (article.title || 'Untitled Story').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const itemSummary = (article.summary || article.meta_description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const itemCategory = (article.category || 'General').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const itemAuthor = (article.author || 'WhyThisBuzz Editorial').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `    <item>
      <title><![CDATA[${itemTitle}]]></title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${validPubDate}</pubDate>
      <description><![CDATA[${itemSummary}]]></description>
      <category><![CDATA[${itemCategory}]]></category>
      <author><![CDATA[editor@whythisbuzz.com (${itemAuthor})]]></author>
    </item>`;
    }).join('\n');

    const feedXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

    return new Response(feedXml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1200, s-maxage=1200, stale-while-revalidate=86400',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
