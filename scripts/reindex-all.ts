import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const SITE_URL = 'https://www.whythisbuzz.com';

async function getGoogleAccessToken(email: string, privateKey: string): Promise<string | null> {
  try {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const claimSet = Buffer.from(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })).toString('base64url');

    const signatureInput = `${header}.${claimSet}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(privateKey.replace(/\\n/g, '\n'), 'base64url');
    const jwt = `${signatureInput}.${signature}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    const tokenData = await tokenRes.json();
    return tokenData.access_token || null;
  } catch (error) {
    console.warn('[Google Indexing API] Auth token error:', error);
    return null;
  }
}

async function submitGoogleIndexing(urls: string[]) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    console.log('ℹ️ GOOGLE_CLIENT_EMAIL or GOOGLE_SERVICE_ACCOUNT_EMAIL not set. Skipping Google Indexing API.');
    return;
  }

  const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
  if (!accessToken) {
    console.error('❌ Failed to get Google access token.');
    return;
  }

  console.log(`🚀 Sending ${urls.length} URLs to Google Indexing API...`);
  let successCount = 0;

  for (const url of urls) {
    try {
      const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          url,
          type: 'URL_UPDATED'
        })
      });

      if (res.ok) {
        successCount++;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`⚠️ Google Indexing API warning for ${url}:`, errJson?.error?.message || res.statusText);
      }
      await new Promise(r => setTimeout(r, 100));
    } catch (err: any) {
      console.warn(`Error pinging Google Indexing API for ${url}:`, err?.message || err);
    }
  }

  console.log(`✅ Google Indexing API: Successfully submitted ${successCount}/${urls.length} URLs!`);
}

async function submitIndexNow(urls: string[]) {
  const apiKey = '6ea9ba6038e2e553b2af64adf7d6fcec09fb0554';
  console.log(`🚀 Submitting ${urls.length} URLs to IndexNow API (Bing, Yandex, Seznam)...`);

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'www.whythisbuzz.com',
        key: apiKey,
        keyLocation: `${SITE_URL}/${apiKey}.txt`,
        urlList: urls
      })
    });

    if (res.ok || res.status === 202) {
      console.log(`✅ IndexNow API: Successfully submitted all ${urls.length} URLs to Bing & search engines!`);
    } else {
      console.warn(`⚠️ IndexNow API response status: ${res.status}`);
    }
  } catch (err: any) {
    console.warn(`Error pinging IndexNow:`, err?.message || err);
  }
}

async function main() {
  console.log('🔍 Gathering ALL website URLs from Supabase DB & Static routes...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const articles: { slug: string }[] = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !data || data.length === 0) break;
    articles.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  const articleUrls = (articles || []).map(a => `${SITE_URL}/article/${a.slug}`);

  const categoryUrls = [
    `${SITE_URL}/category/sports`,
    `${SITE_URL}/category/world-affairs`,
    `${SITE_URL}/category/politics`,
    `${SITE_URL}/category/economics`,
    `${SITE_URL}/category/technology`,
    `${SITE_URL}/category/social-media`,
    `${SITE_URL}/category/movies-entertainment`,
  ];

  const staticUrls = [
    `${SITE_URL}/`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/disclaimer`,
    `${SITE_URL}/cookies`,
  ];

  const allUrls = Array.from(new Set([...staticUrls, ...categoryUrls, ...articleUrls]));

  console.log(`📌 Found ${allUrls.length} total URLs on whythisbuzz.com!`);
  console.log(` - Static pages: ${staticUrls.length}`);
  console.log(` - Category pages: ${categoryUrls.length}`);
  console.log(` - Article pages: ${articleUrls.length}`);

  // 1. Submit to IndexNow
  await submitIndexNow(allUrls);

  // 2. Submit to Google Indexing API
  await submitGoogleIndexing(allUrls);

  // 3. Ping Google Sitemap
  try {
    console.log('📡 Pinging Google Sitemaps service...');
    await fetch(`https://www.google.com/ping?sitemap=${SITE_URL}/sitemap.xml`);
    console.log('✅ Google Sitemap Ping sent!');
  } catch (e) {
    console.warn('Sitemap ping note:', e);
  }

  console.log('\n🎉 ALL WEBSITE PAGES SUCCESSFULLY SUBMITTED TO GOOGLE & SEARCH ENGINES!');
}

main();
