import { Client, Databases, Query, Models } from 'node-appwrite';
import { Article, ArticleMetadata } from './mdx';
import fs from 'fs';
import path from 'path';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'whythisbuzz_db';
const collectionId = process.env.APPWRITE_COLLECTION_ID || 'articles';
const apiKey = process.env.APPWRITE_API_KEY || '';

// ─── Cross-worker circuit breaker via filesystem marker ───
// The prebuild script writes this file if Appwrite is unreachable.
// All Next.js workers read it once at startup to skip Appwrite instantly.
const MARKER_PATH = path.join(process.cwd(), '.appwrite-disabled');

let appwriteGloballyDisabled: boolean | null = null; // null = not yet checked

function isAppwriteMarkedDisabled(): boolean {
    if (appwriteGloballyDisabled !== null) return appwriteGloballyDisabled;
    try {
        appwriteGloballyDisabled = fs.existsSync(MARKER_PATH);
        if (appwriteGloballyDisabled) {
            console.log('⚡ Appwrite marked disabled by prebuild — all Appwrite calls skipped (0ms)');
        }
    } catch {
        appwriteGloballyDisabled = false;
    }
    return appwriteGloballyDisabled;
}

// Also keep an in-process flag for runtime errors
let appwriteDisabledInProcess = false;

function isDisabled(): boolean {
    return !projectId || appwriteDisabledInProcess || isAppwriteMarkedDisabled();
}

function markDisabledAndWriteFile() {
    appwriteDisabledInProcess = true;
    appwriteGloballyDisabled = true;
    // Write the marker file so other workers pick it up too
    try {
        fs.writeFileSync(MARKER_PATH, `disabled at ${new Date().toISOString()}\n`);
    } catch {
        // Ignore write errors (read-only filesystem, etc.)
    }
}

function getAppwriteDatabases() {
    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId);

    if (apiKey) {
        client.setKey(apiKey);
    }

    return new Databases(client);
}

export interface AppwriteArticleDoc extends Models.Document {
    slug: string;
    title: string;
    summary?: string;
    content?: string;
    category: string;
    author?: string;
    date: string;
    readTime?: string;
    imageUrl?: string;
    seoTitle?: string;
    metaDescription?: string;
    keywords?: string;
}

function docToArticle(doc: AppwriteArticleDoc): Article {
    return {
        metadata: {
            id: doc.slug,
            title: doc.title,
            description: doc.summary || doc.metaDescription || '',
            date: doc.date,
            author: doc.author,
            category: doc.category,
            imageUrl: doc.imageUrl,
            readTime: doc.readTime,
            summary: doc.summary || '',
            seoTitle: doc.seoTitle,
            metaDescription: doc.metaDescription,
            keywords: doc.keywords,
        } as ArticleMetadata,
        content: doc.content || '',
    };
}

let cachedArticles: Article[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function getAppwriteArticles(): Promise<Article[]> {
    if (isDisabled()) return cachedArticles || [];
    const now = Date.now();
    if (cachedArticles && (now - cacheTimestamp < CACHE_TTL)) {
        return cachedArticles;
    }

    try {
        const databases = getAppwriteDatabases();
        let allDocs: AppwriteArticleDoc[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
                Query.limit(limit),
                Query.offset(offset),
            ]);
            allDocs = allDocs.concat(response.documents);
            if (response.documents.length < limit) break;
            offset += limit;
        }

        const articles = allDocs.map(docToArticle);
        articles.sort((a, b) => {
            const timeA = new Date(a.metadata.date).getTime() || 0;
            const timeB = new Date(b.metadata.date).getTime() || 0;
            return timeB - timeA;
        });

        cachedArticles = articles;
        cacheTimestamp = now;
        return articles;
    } catch (e) {
        console.warn('⚠️ Appwrite error (getArticles), disabling globally:', e instanceof Error ? e.message : e);
        markDisabledAndWriteFile();
        return cachedArticles || [];
    }
}

export async function getAppwriteArticleBySlug(slug: string): Promise<Article | undefined> {
    if (isDisabled()) return undefined;

    // Check in-memory cache first to avoid 900+ HTTP calls during static build
    if (cachedArticles) {
        const found = cachedArticles.find(a => a.metadata.id === slug);
        if (found) return found;
    }

    try {
        const databases = getAppwriteDatabases();
        const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
            Query.equal('slug', slug),
            Query.limit(1),
        ]);
        if (response.documents.length === 0) return undefined;
        return docToArticle(response.documents[0]);
    } catch (e) {
        console.warn(`⚠️ Appwrite error for slug ${slug}, disabling globally:`, e instanceof Error ? e.message : e);
        markDisabledAndWriteFile();
        return undefined;
    }
}

export async function getAppwriteArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
    if (isDisabled()) return [];
    if (cachedArticles) {
        return cachedArticles
            .filter(a => a.metadata.category.toLowerCase() === category.toLowerCase())
            .map(a => a.metadata);
    }

    try {
        const databases = getAppwriteDatabases();
        let allDocs: AppwriteArticleDoc[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
                Query.equal('category', category),
                Query.limit(limit),
                Query.offset(offset),
            ]);
            allDocs = allDocs.concat(response.documents);
            if (response.documents.length < limit) break;
            offset += limit;
        }

        const articles = allDocs.map(docToArticle).map(a => a.metadata);
        articles.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });
        return articles;
    } catch (e) {
        console.warn(`⚠️ Appwrite error for category ${category}, disabling globally:`, e instanceof Error ? e.message : e);
        markDisabledAndWriteFile();
        return [];
    }
}

export async function getAppwriteArticleSlugs(): Promise<string[]> {
    if (isDisabled()) return [];
    if (cachedArticles) {
        return cachedArticles.map(a => a.metadata.id);
    }

    try {
        const databases = getAppwriteDatabases();
        let allSlugs: string[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
                Query.limit(limit),
                Query.offset(offset),
                Query.select(['slug']),
            ]);
            allSlugs = allSlugs.concat(response.documents.map(doc => doc.slug));
            if (response.documents.length < limit) break;
            offset += limit;
        }

        return allSlugs;
    } catch (e) {
        console.warn('⚠️ Appwrite error for slugs, disabling globally:', e instanceof Error ? e.message : e);
        markDisabledAndWriteFile();
        return [];
    }
}
