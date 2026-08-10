import { Client, Databases, Query, Models } from 'node-appwrite';
import { Article, ArticleMetadata } from './mdx';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'whythisbuzz_db';
const collectionId = process.env.APPWRITE_COLLECTION_ID || 'articles';
const apiKey = process.env.APPWRITE_API_KEY || '';

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

export async function getAppwriteArticles(): Promise<Article[]> {
    if (!projectId) return [];
    try {
        const databases = getAppwriteDatabases();
        let allDocs: AppwriteArticleDoc[] = [];
        let offset = 0;
        const limit = 100;

        while (true) {
            const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc('date'),
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
        return articles;
    } catch (e) {
        console.error('Appwrite fetch error:', e);
        return [];
    }
}

export async function getAppwriteArticleBySlug(slug: string): Promise<Article | undefined> {
    if (!projectId) return undefined;
    try {
        const databases = getAppwriteDatabases();
        const response = await databases.listDocuments<AppwriteArticleDoc>(databaseId, collectionId, [
            Query.equal('slug', slug),
            Query.limit(1),
        ]);
        if (response.documents.length === 0) return undefined;
        return docToArticle(response.documents[0]);
    } catch (e) {
        console.error(`Appwrite fetch error for slug ${slug}:`, e);
        return undefined;
    }
}

export async function getAppwriteArticlesByCategory(category: string): Promise<ArticleMetadata[]> {
    if (!projectId) return [];
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
        console.error(`Appwrite fetch error for category ${category}:`, e);
        return [];
    }
}

export async function getAppwriteArticleSlugs(): Promise<string[]> {
    if (!projectId) return [];
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
        console.error('Appwrite fetch slugs error:', e);
        return [];
    }
}
