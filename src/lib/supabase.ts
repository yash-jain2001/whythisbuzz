import { createClient } from '@supabase/supabase-js';
import { Article, ArticleMetadata } from './mdx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}

export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface SupabaseArticleDoc {
    id?: string;
    slug: string;
    title: string;
    summary?: string;
    content?: string;
    category: string;
    author?: string;
    date: string;
    read_time?: string;
    image_url?: string;
    seo_title?: string;
    meta_description?: string;
    keywords?: string;
    created_at?: string;
    geo?: string;
    country?: string;
}

function formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    // If it's ISO format like "2026-08-10", format to "Aug 10, 2026"
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
}

import { getCountryForArticle, getRelativeTrendTime, normalizeCategory } from './country-utils';

function docToArticle(doc: SupabaseArticleDoc): Article {
    const country = getCountryForArticle(doc.country);
    const trendTime = getRelativeTrendTime(doc.date, doc.created_at);
    const category = normalizeCategory(doc.title, doc.summary, doc.category);

    return {
        metadata: {
            id: doc.slug,
            title: doc.title,
            description: doc.summary || doc.meta_description || '',
            date: formatDateDisplay(doc.date),
            author: doc.author || 'WhyThisBuzz Desk',
            category: category,
            imageUrl: doc.image_url || '',
            readTime: doc.read_time || '3 min read',
            summary: doc.summary || '',
            seoTitle: doc.seo_title,
            metaDescription: doc.meta_description,
            keywords: doc.keywords,
            country: country.code,
            countryFlag: country.flag,
            countryName: country.name,
            trendTime: trendTime,
        } as ArticleMetadata,
        content: doc.content || '',
    };
}

// ─── Single-batch in-memory cache ───────────────────────────
// During static generation on Cloudflare, all articles are fetched
// in ONE SINGLE BATCH query. Zero extra network calls!
let cachedArticles: Article[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function getSupabaseArticles(limit: number = 50): Promise<Article[]> {
    if (!supabase) return cachedArticles ? cachedArticles.slice(0, limit) : [];
    const now = Date.now();
    
    // Only return cached articles if the cache contains at least the requested limit
    if (cachedArticles && cachedArticles.length >= limit && (now - cacheTimestamp < CACHE_TTL)) {
        return cachedArticles.slice(0, limit);
    }

    try {
        const pageSize = 1000;
        const allDocs: SupabaseArticleDoc[] = [];
        let page = 0;

        while (allDocs.length < limit) {
            const fetchSize = Math.min(pageSize, limit - allDocs.length);
            const start = page * pageSize;
            const end = start + fetchSize - 1;

            const { data, error } = await supabase
              .from('articles')
              .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at, country')
              .order('created_at', { ascending: false })
              .order('date', { ascending: false })
              .range(start, end);

            if (error || !data || data.length === 0) break;
            allDocs.push(...data);
            if (data.length < fetchSize) break;
            page++;
        }

        if (allDocs.length === 0) {
            return cachedArticles ? cachedArticles.slice(0, limit) : [];
        }

        const articles = allDocs.map(docToArticle);
        
        // Cache articles array if it is larger or more complete than previous cache
        if (!cachedArticles || articles.length >= cachedArticles.length) {
            cachedArticles = articles;
            cacheTimestamp = now;
        }

        return articles.slice(0, limit);
    } catch (e) {
        console.warn('⚠️ Supabase connection error:', e instanceof Error ? e.message : e);
        return cachedArticles ? cachedArticles.slice(0, limit) : [];
    }
}

export async function getSupabaseArticleBySlug(slug: string): Promise<Article | undefined> {
    if (!supabase) return undefined;

    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) return undefined;
        return docToArticle(data);
    } catch {
        return undefined;
    }
}

function docToMetadata(doc: SupabaseArticleDoc): ArticleMetadata {
    return {
        id: doc.slug,
        title: doc.title,
        description: doc.summary || doc.meta_description || '',
        date: formatDateDisplay(doc.date),
        author: doc.author || 'WhyThisBuzz Desk',
        category: doc.category,
        imageUrl: doc.image_url || '',
        readTime: doc.read_time || '3 min read',
        summary: doc.summary || '',
        seoTitle: doc.seo_title,
        metaDescription: doc.meta_description,
        keywords: doc.keywords,
        trendTime: getRelativeTrendTime(doc.date, doc.created_at),
    } as ArticleMetadata;
}

export async function getSupabaseArticlesByCategory(category: string, limit: number = 8): Promise<ArticleMetadata[]> {
    if (!supabase) return [];

    try {
        const catLower = category.toLowerCase().replace(/[-_]/g, ' ').trim();
        let query = supabase
            .from('articles')
            .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords, created_at')
            .order('created_at', { ascending: false })
            .order('date', { ascending: false });

        if (catLower.includes('politic')) {
            query = query.ilike('category', '%Politic%');
        } else if (catLower.includes('economic') || catLower.includes('finance')) {
            query = query.or('category.ilike.%Economic%,category.ilike.%Finance%');
        } else if (catLower.includes('social')) {
            query = query.ilike('category', '%Social%');
        } else if (catLower.includes('tech')) {
            query = query.ilike('category', '%Tech%');
        } else if (catLower.includes('sport')) {
            query = query.ilike('category', '%Sport%');
        } else if (catLower.includes('movie') || catLower.includes('entertain')) {
            query = query.or('category.ilike.%Movie%,category.ilike.%Entertain%');
        } else if (catLower.includes('world')) {
            query = query.ilike('category', '%World%');
        } else {
            query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query.limit(limit);

        if (!error && data && data.length > 0) {
            return data.map(docToMetadata);
        }

        return [];
    } catch {
        return [];
    }
}

export async function getSupabaseArticleSlugs(limit: number = 50): Promise<string[]> {
    const articles = await getSupabaseArticles(limit);
    return articles.map(a => a.metadata.id);
}
