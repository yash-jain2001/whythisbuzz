export async function onRequest(context: { env?: Record<string, string> }): Promise<Response> {
    const baseUrl = 'https://whythisbuzz.com';
    const currentDate = new Date().toISOString();

    const env = context.env || {};
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://duqkblgwbydqhmlmcfxp.supabase.co';
    const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1cWtibGd3YnlkcWhtbG1jZnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODEwMjcsImV4cCI6MjEwMTk1NzAyN30.rXZrpHV_5qG3_FI7Ny5bLrNKkWZEgiNSbv9-gqOn8Vc';

    let articles: Array<{ slug: string; date?: string; created_at?: string }> = [];

    try {
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const start = page * pageSize;
            const end = start + pageSize - 1;
            const res = await fetch(
                `${supabaseUrl}/rest/v1/articles?select=slug,date,created_at&order=created_at.desc&order=date.desc`,
                {
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`,
                        'Range': `${start}-${end}`,
                        'Range-Unit': 'items'
                    }
                }
            );

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    articles = articles.concat(data);
                    if (data.length < pageSize) hasMore = false;
                    else page++;
                } else {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        }
    } catch (e) {
        console.error('Error fetching articles for dynamic sitemap:', e);
    }

    const categories = [
        'sports',
        'world-affairs',
        'politics',
        'economics',
        'technology',
        'social-media',
        'movies',
        'entertainment'
    ];

    const staticPages = [
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/disclaimer',
        '/cookies',
        '/trending'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Homepage
    xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // 2. Category Pages
    for (const cat of categories) {
        xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    // 3. Static Pages
    for (const p of staticPages) {
        xml += `  <url>\n    <loc>${baseUrl}${p}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    // 4. Articles
    const now = Date.now();
    for (const article of articles) {
        if (!article.slug) continue;
        const articleDateStr = article.created_at || article.date || currentDate;
        const articleDateObj = new Date(articleDateStr);
        const validDate = isNaN(articleDateObj.getTime()) ? currentDate : articleDateObj.toISOString();
        const isRecent = (now - new Date(validDate).getTime()) <= 7 * 24 * 60 * 60 * 1000;
        const priority = isRecent ? '0.9' : '0.7';

        xml += `  <url>\n    <loc>${baseUrl}/article/${article.slug}</loc>\n    <lastmod>${validDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
            'Access-Control-Allow-Origin': '*'
        }
    });
}
