import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
    getAppwriteArticles,
    getAppwriteArticleBySlug,
    getAppwriteArticlesByCategory,
    getAppwriteArticleSlugs,
} from './appwrite';

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

function isAppwriteEnabled(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
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

export async function getArticleSlugs(): Promise<string[]> {
    if (isAppwriteEnabled()) {
        const slugs = await getAppwriteArticleSlugs();
        if (slugs.length > 0) return slugs;
    }
    const files = getLocalMdxFiles(contentDirectory);
    return files.map((file) => path.basename(file, '.mdx'));
}

import { cache } from 'react';

export const getArticleBySlug = cache(async (slug: string): Promise<Article | undefined> => {
    const cleanSlug = slug.replace(/\.mdx$/, '');
    if (isAppwriteEnabled()) {
        const appwriteArticle = await getAppwriteArticleBySlug(cleanSlug);
        if (appwriteArticle) return appwriteArticle;
    }

    const files = getLocalMdxFiles(contentDirectory);
    const targetFile = files.find((file) => path.basename(file, '.mdx') === cleanSlug);

    if (!targetFile) return undefined;

    try {
        const fileContents = fs.readFileSync(targetFile, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title || !data.category) return undefined;

        const safeDate =
            data.date && !isNaN(new Date(data.date).getTime())
                ? data.date
                : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const fallbackImages: Record<string, string> = {
            Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
            Entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
            Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
            'World Affairs': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
            Movies: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
            'Social-Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
            'Social Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
        };
        const safeImageUrl =
            data.imageUrl && !data.imageUrl.includes('placeholder')
                ? data.imageUrl
                : fallbackImages[data.category] || fallbackImages['World Affairs'];

        return {
            metadata: {
                ...data,
                id: cleanSlug,
                date: safeDate,
                imageUrl: safeImageUrl,
                summary: data.summary || data.description || '',
                description: data.description || data.summary || '',
            } as ArticleMetadata,
            content,
        };
    } catch {
        return undefined;
    }
});

export async function getAllArticles(): Promise<Article[]> {
    let articles: Article[] = [];
    if (isAppwriteEnabled()) {
        articles = await getAppwriteArticles();
    }

    if (articles.length === 0) {
        const slugs = await getArticleSlugs();
        articles = (
            await Promise.all(slugs.map((slug) => getArticleBySlug(slug)))
        ).filter((article): article is Article => article !== undefined);
    }

    return articles.sort((a, b) => {
        const timeA = new Date(a.metadata.date).getTime() || 0;
        const timeB = new Date(b.metadata.date).getTime() || 0;
        return timeB - timeA;
    });
}

export async function getRelatedArticles(currentId: string, category?: string, limit: number = 3): Promise<ArticleMetadata[]> {
    const allArticles = await getAllArticles();
    const filtered = allArticles
        .filter((article) => article.metadata.id !== currentId)
        .map((article) => article.metadata);

    if (category) {
        const sameCat = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
        if (sameCat.length >= limit) return sameCat.slice(0, limit);
    }

    return filtered.slice(0, limit);
}

export async function getArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
    if (isAppwriteEnabled()) {
        const appwriteCategoryArticles = await getAppwriteArticlesByCategory(category);
        if (appwriteCategoryArticles.length > 0) return appwriteCategoryArticles;
    }

    const allArticles = await getAllArticles();
    return allArticles
        .map((article) => article.metadata)
        .filter((article) => article.category.toLowerCase() === category.toLowerCase());
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
