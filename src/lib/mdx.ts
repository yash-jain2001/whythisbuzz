import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

const contentDirectory = path.join(process.cwd(), 'src/content');

export interface ArticleMetadata {
    id: string;
    title: string;
    description: string;
    date: string;
    author: string;
    category: string;
    imageUrl: string;
    readTime: string;
    summary: string;
    seoTitle?: string;
    metaDescription?: string;
    keywords?: string;
}

export interface Article {
    metadata: ArticleMetadata;
    content: string;
}

// ─── Cached local file index ───────────────────────────────
let _localFileIndex: Map<string, string> | null = null;

function getLocalFileIndex(): Map<string, string> {
    if (_localFileIndex) return _localFileIndex;
    _localFileIndex = new Map();
    const files = getLocalMdxFiles(contentDirectory);
    for (const file of files) {
        const slug = path.basename(file, '.mdx');
        _localFileIndex.set(slug, file);
    }
    return _localFileIndex;
}

// ─── Cached metadata index ─────────────────────────────────
let _metadataCache: Map<string, ArticleMetadata> | null = null;

function getAllLocalMetadata(): Map<string, ArticleMetadata> {
    if (_metadataCache) return _metadataCache;
    _metadataCache = new Map();
    const index = getLocalFileIndex();
    for (const [slug, filePath] of index) {
        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const { data } = matter(fileContents);
            if (!data.title || !data.category) continue;
            const meta = buildMetadata(slug, data);
            _metadataCache.set(slug, meta);
        } catch {
            // skip broken files
        }
    }
    return _metadataCache;
}

// Local helper to recursively find all MDX files
function getLocalMdxFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getLocalMdxFiles(filePath));
        } else if (file.endsWith('.mdx')) {
            results.push(filePath);
        }
    });
    return results;
}

const fallbackImages: Record<string, string> = {
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    Entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
    Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    'World Affairs': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
    Movies: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    'Social-Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
    'Social Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
};

function buildMetadata(slug: string, data: Record<string, unknown>): ArticleMetadata {
    const safeDate =
        data.date && !isNaN(new Date(data.date as string).getTime())
            ? (data.date as string)
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const safeImageUrl =
        data.imageUrl && !(data.imageUrl as string).includes('placeholder')
            ? (data.imageUrl as string)
            : fallbackImages[data.category as string] || fallbackImages['World Affairs'];

    return {
        id: slug,
        title: data.title as string,
        description: (data.description as string) || (data.summary as string) || '',
        date: safeDate,
        author: data.author as string,
        category: data.category as string,
        imageUrl: safeImageUrl,
        readTime: data.readTime as string,
        summary: (data.summary as string) || (data.description as string) || '',
        seoTitle: data.seoTitle as string | undefined,
        metaDescription: data.metaDescription as string | undefined,
        keywords: data.keywords as string | undefined,
    } as ArticleMetadata;
}

export async function getArticleSlugs(limit: number = 50): Promise<string[]> {
    const metaMap = getAllLocalMetadata();
    const sorted = Array.from(metaMap.values()).sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
    });
    return sorted.slice(0, limit).map((m) => m.id);
}

export const getArticleBySlug = cache(async (slug: string): Promise<Article | undefined> => {
    const cleanSlug = slug.replace(/\.mdx$/, '');
    const index = getLocalFileIndex();
    const targetFile = index.get(cleanSlug);
    if (!targetFile) return undefined;

    try {
        const fileContents = fs.readFileSync(targetFile, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title || !data.category) return undefined;

        return {
            metadata: buildMetadata(cleanSlug, data),
            content,
        };
    } catch {
        return undefined;
    }
});

export async function getAllArticles(): Promise<Article[]> {
    const slugs = await getArticleSlugs(50);
    const articles = (
        await Promise.all(slugs.map((slug) => getArticleBySlug(slug)))
    ).filter((article): article is Article => article !== undefined);

    return articles.sort((a, b) => {
        const timeA = new Date(a.metadata.date).getTime() || 0;
        const timeB = new Date(b.metadata.date).getTime() || 0;
        return timeB - timeA;
    });
}

export async function getRelatedArticles(currentId: string, category?: string, limit: number = 3): Promise<ArticleMetadata[]> {
    const metaMap = getAllLocalMetadata();
    const allMeta = Array.from(metaMap.values())
        .filter(m => m.id !== currentId)
        .sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });

    if (category) {
        const sameCat = allMeta.filter((a) => a.category.toLowerCase() === category.toLowerCase());
        if (sameCat.length >= limit) return sameCat.slice(0, limit);
    }

    return allMeta.slice(0, limit);
}

export async function getArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
    const metaMap = getAllLocalMetadata();
    return Array.from(metaMap.values())
        .filter((m) => m.category.toLowerCase() === category.toLowerCase())
        .sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
}

export function getAllCategories(): string[] {
    if (!fs.existsSync(contentDirectory)) {
        return ['Sports', 'Entertainment', 'Technology', 'World Affairs', 'Movies', 'Social-Media'];
    }
    const categories = fs
        .readdirSync(contentDirectory, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    return categories.length > 0 ? categories : ['Sports', 'Entertainment', 'Technology', 'World Affairs', 'Movies', 'Social-Media'];
}
