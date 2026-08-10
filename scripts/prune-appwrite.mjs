/**
 * prune-appwrite.mjs
 *
 * Keeps Appwrite Database light & fast by deleting older articles while retaining
 * only the most recent N articles (e.g. latest 100 articles).
 * All historical articles remain saved as local MDX files in src/content/ for SEO.
 *
 * Run via: node scripts/prune-appwrite.mjs
 * Or specify count: node scripts/prune-appwrite.mjs --keep=50
 */

import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'whythisbuzz_db';
const collectionId = process.env.APPWRITE_COLLECTION_ID || 'articles';
const apiKey = process.env.APPWRITE_API_KEY;

// Parse CLI flag --keep=N (default 100)
const keepArg = process.argv.find(arg => arg.startsWith('--keep='));
const KEEP_LIMIT = keepArg ? parseInt(keepArg.split('=')[1], 10) || 100 : 100;

if (!projectId || !apiKey) {
    console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

async function prune() {
    console.log(`🧹 Fetching all articles from Appwrite (keeping latest ${KEEP_LIMIT})...`);
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

        console.log(`📦 Found ${allDocs.length} total articles in Appwrite Database.`);

        if (allDocs.length <= KEEP_LIMIT) {
            console.log(`✅ Appwrite Database already contains ${allDocs.length} articles (<= limit ${KEEP_LIMIT}). No deletion needed!`);
            return;
        }

        // Sort newest first by date
        allDocs.sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
        });

        // Keep top N, delete the rest
        const toKeep = allDocs.slice(0, KEEP_LIMIT);
        const toDelete = allDocs.slice(KEEP_LIMIT);

        console.log(`🗑️ Deleting ${toDelete.length} older articles from Appwrite...`);

        let deletedCount = 0;
        for (const doc of toDelete) {
            try {
                await databases.deleteDocument(databaseId, collectionId, doc.$id);
                deletedCount++;
                console.log(`  [${deletedCount}/${toDelete.length}] ❌ Deleted old document: ${doc.slug} (${doc.date})`);
            } catch (err) {
                console.error(`  ⚠️ Failed to delete ${doc.slug}:`, err.message);
            }
        }

        console.log(`\n🎉 Pruning complete! Kept ${toKeep.length} newest articles, deleted ${deletedCount} older articles.`);
    } catch (err) {
        console.error('❌ Pruning failed:', err.message);
    }
}

prune();
