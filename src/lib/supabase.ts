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

function docToArticle(doc: SupabaseArticleDoc): Article {
    return {
        metadata: {
            id: doc.slug,
            title: doc.title,
            description: doc.summary || doc.meta_description || '',
            date: doc.date,
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
        const { data, error } = await supabase
            .from('articles')
            .select('*');

        if (error || !data) {
            console.warn('⚠️ Supabase fetch warning:', error?.message);
            return cachedArticles || [];
        }

        const articles = data.map(docToArticle);
        // Sort by actual JS Date timestamp (prevents alphabetical string sorting issues like "May" > "Aug")
        articles.sort((a, b) => {
            const timeA = new Date(a.metadata.date).getTime() || 0;
            const timeB = new Date(b.metadata.date).getTime() || 0;
            return timeB - timeA;
        });

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

    // Check in-memory cache first to avoid extra API calls
    if (cachedArticles) {
        const found = cachedArticles.find(a => a.metadata.id === slug);
        if (found) return found;
    }

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
    const articles = await getSupabaseArticles(100);
    return articles
        .filter(a => a.metadata.category.toLowerCase() === category.toLowerCase())
        .slice(0, limit)
        .map(a => a.metadata);
}

export async function getSupabaseArticleSlugs(limit: number = 50): Promise<string[]> {
    const articles = await getSupabaseArticles(limit);
    return articles.map(a => a.metadata.id);
}
