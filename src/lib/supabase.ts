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

function docToArticle(doc: SupabaseArticleDoc): Article {
    return {
        metadata: {
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
    if (!supabase) return cachedArticles || [];
    const now = Date.now();
    if (cachedArticles && (now - cacheTimestamp < CACHE_TTL)) {
        return cachedArticles.slice(0, limit);
    }

    try {
        // Query lightweight fields with limit and indexed created_at sorting to prevent statement timeouts
        const fetchLimit = Math.max(limit, 100);
        const { data, error } = await supabase
            .from('articles')
            .select('slug, title, summary, category, author, date, read_time, image_url, seo_title, meta_description, keywords, created_at')
            .order('created_at', { ascending: false })
            .limit(fetchLimit);

        if (error || !data) {
            console.warn('⚠️ Supabase fetch warning:', error?.message);
            return cachedArticles || [];
        }

        const articles = data.map(docToArticle);
        cachedArticles = articles;
        cacheTimestamp = now;
        return articles.slice(0, limit);
    } catch (e) {
        console.warn('⚠️ Supabase connection error:', e instanceof Error ? e.message : e);
        return cachedArticles || [];
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

export async function getSupabaseArticlesByCategory(category: string, limit: number = 50): Promise<ArticleMetadata[]> {
    const articles = await getSupabaseArticles(1000);
    const catLower = category.toLowerCase().replace(/[-_]/g, ' ').trim();

    return articles
        .filter(a => {
            const cLower = a.metadata.category.toLowerCase().replace(/[-_]/g, ' ').trim();
            return cLower === catLower || cLower.includes(catLower) || catLower.includes(cLower);
        })
        .slice(0, limit)
        .map(a => a.metadata);
}

export async function getSupabaseArticleSlugs(limit: number = 50): Promise<string[]> {
    const articles = await getSupabaseArticles(limit);
    return articles.map(a => a.metadata.id);
}
