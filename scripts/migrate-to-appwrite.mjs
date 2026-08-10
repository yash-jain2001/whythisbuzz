/**
 * migrate-to-appwrite.mjs
 *
 * Fast concurrent migration script to bulk upload all MDX files from src/content into Appwrite Database.
 * Run via: node scripts/migrate-to-appwrite.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'whythisbuzz_db';
const collectionId = process.env.APPWRITE_COLLECTION_ID || 'articles';
const apiKey = process.env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
    console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);
const contentDir = path.join(__dirname, '..', 'src', 'content');

function parseFrontmatter(fileContent) {
    const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { data: {}, body: fileContent };

    const fm = {};
    const lines = match[1].split(/\r?\n/);
    for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        value = value.replace(/^["']|["']$/g, '');
        fm[key] = value;
    }

    const body = fileContent.slice(match[0].length).trim();
    return { data: fm, body };
}

function getMdxFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const filePath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getMdxFiles(filePath));
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
            results.push(filePath);
        }
    }
    return results;
}

const fallbackImages = {
    Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    Entertainment: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
    Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    'World Affairs': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
    Movies: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    'Social-Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
    'Social Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200',
};

async function processFile(filePath, index, total) {
    const slug = path.basename(filePath, '.mdx');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(fileContent);

    if (!data.title || !data.category) {
        console.log(`⚠️ Skipping ${slug}: Missing title or category`);
        return { status: 'skipped' };
    }

    const imageUrl = data.imageUrl && !data.imageUrl.includes('placeholder')
        ? data.imageUrl
        : fallbackImages[data.category] || fallbackImages['World Affairs'];

    const documentData = {
        slug,
        title: data.title.slice(0, 500),
        summary: (data.summary || data.description || '').slice(0, 2000),
        content: body.slice(0, 100000),
        category: data.category.slice(0, 100),
        author: (data.author || 'WhyThisBuzz Editorial').slice(0, 100),
        date: (data.date || new Date().toLocaleDateString('en-US')).slice(0, 100),
        readTime: (data.readTime || '5 min read').slice(0, 50),
        imageUrl: imageUrl.slice(0, 2000),
        seoTitle: (data.seoTitle || '').slice(0, 500),
        metaDescription: (data.metaDescription || '').slice(0, 1000),
        keywords: (data.keywords || '').slice(0, 1000),
    };

    try {
        const existing = await databases.listDocuments(databaseId, collectionId, [
            Query.equal('slug', slug)
        ]);

        if (existing.total > 0) {
            await databases.updateDocument(
                databaseId,
                collectionId,
                existing.documents[0].$id,
                documentData
            );
            console.log(`[${index + 1}/${total}] 🔄 Updated: ${slug}`);
        } else {
            await databases.createDocument(
                databaseId,
                collectionId,
                ID.unique(),
                documentData
            );
            console.log(`[${index + 1}/${total}] ✅ Created: ${slug}`);
        }
        return { status: 'success' };
    } catch (err) {
        console.error(`[${index + 1}/${total}] ❌ Failed: ${slug}`, err.message);
        return { status: 'failed' };
    }
}

async function migrate() {
    console.log('🔍 Scanning content directory for MDX files...');
    const files = getMdxFiles(contentDir);
    console.log(`📄 Found ${files.length} MDX files.`);

    const BATCH_SIZE = 10;
    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const promises = batch.map((file, idx) => processFile(file, i + idx, files.length));
        const results = await Promise.all(promises);

        for (const res of results) {
            if (res.status === 'success') successCount++;
            else if (res.status === 'skipped') skipCount++;
            else if (res.status === 'failed') failCount++;
        }
    }

    console.log('\n================ Migration Summary ================');
    console.log(`Total: ${files.length} | Success: ${successCount} | Skipped: ${skipCount} | Failed: ${failCount}`);

    console.log('\n🧹 Automatically pruning old articles from Appwrite to stay within Free Tier limits...');
    try {
        let allDocs = [];
        let offset = 0;
        const limit = 100;
        while (true) {
            const res = await databases.listDocuments(databaseId, collectionId, [
                Query.limit(limit),
                Query.offset(offset),
            ]);
            allDocs = allDocs.concat(res.documents);
            if (res.documents.length < limit) break;
            offset += limit;
        }

        const KEEP_LIMIT = 50;
        if (allDocs.length > KEEP_LIMIT) {
            allDocs.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
            const toDelete = allDocs.slice(KEEP_LIMIT);
            console.log(`🗑️ Deleting ${toDelete.length} old articles from Appwrite...`);
            for (const doc of toDelete) {
                try {
                    await databases.deleteDocument(databaseId, collectionId, doc.$id);
                } catch (_) {}
            }
            console.log(`✅ Auto-pruned Appwrite DB to latest ${KEEP_LIMIT} articles.`);
        }
    } catch (e) {
        console.warn('⚠️ Auto-prune warning:', e.message);
    }
}

migrate();
