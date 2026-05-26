export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      return new Response(`Failed to fetch external image: ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    // Aggressively cache the proxied image on Cloudflare's Edge and client browser for peak performance and AdSense compliance
    const newHeaders = new Headers();
    newHeaders.set('Content-Type', contentType);
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    newHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: 200,
      headers: newHeaders
    });
  } catch (error: any) {
    return new Response(`Error proxying image: ${error.message}`, { status: 500 });
  }
}
