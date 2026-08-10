/**
 * generate-search-data.mjs
 * 
 * Standalone script to regenerate public/search-data.json.
 * Fetches from Appwrite if credentials are present, or falls back to local MDX files.
 * Run via: node scripts/generate-search-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const contentDir = path.join(__dirname, '..', 'src', 'content');
const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'search-data.json');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'whythisbuzz_db';
const collectionId = process.env.APPWRITE_COLLECTION_ID || 'articles';

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

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
  return fm;
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
};

async function generate() {
  const searchData = [];

  if (projectId) {
    console.log('🌐 Fetching articles from Appwrite Cloud for search-data.json...');
    try {
      const client = new Client().setEndpoint(endpoint).setProject(projectId);
      const databases = new Databases(client);
      let offset = 0;
      const limit = 100;
      while (true) {
        const res = await databases.listDocuments(databaseId, collectionId, [
          Query.limit(limit),
          Query.offset(offset),
          Query.orderDesc('date'),
        ]);

        for (const doc of res.documents) {
          searchData.push({
            id: doc.slug,
            title: doc.title,
            summary: doc.summary || doc.metaDescription || '',
            category: doc.category,
            imageUrl: doc.imageUrl,
            readTime: doc.readTime || '3 min read',
            date: doc.date || '',
          });
        }
        if (res.documents.length < limit) break;
        offset += limit;
      }
      console.log(`✅ Fetched ${searchData.length} articles from Appwrite.`);

      // Auto-prune old documents in background if Appwrite has over 50 articles
      if (searchData.length > 50) {
        console.log('🧹 Auto-pruning old articles in Appwrite Database...');
        try {
          const allDocs = await databases.listDocuments(databaseId, collectionId, [Query.limit(100)]);
          const docs = allDocs.documents;
          docs.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
          const toDelete = docs.slice(50);
          for (const d of toDelete) {
            databases.deleteDocument(databaseId, collectionId, d.$id).catch(() => {});
          }
          console.log(`✅ Background pruned ${toDelete.length} old articles from Appwrite.`);
        } catch (_) {}
      }
    } catch (err) {
      console.error('⚠️ Failed to fetch from Appwrite, falling back to local files:', err.message);
    }
  }

  if (searchData.length === 0) {
    console.log('🔍 Scanning local content directory...');
    const files = getMdxFiles(contentDir);
    console.log(`📄 Found ${files.length} local MDX files`);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fm = parseFrontmatter(content);
      if (!fm || !fm.title || !fm.category) continue;

      const slug = path.basename(filePath, '.mdx');
      const imageUrl =
        fm.imageUrl && !fm.imageUrl.includes('placeholder')
          ? fm.imageUrl
          : fallbackImages[fm.category] || fallbackImages['World Affairs'];

      searchData.push({
        id: slug,
        title: fm.title,
        summary: fm.summary || fm.description || '',
        category: fm.category,
        imageUrl,
        readTime: fm.readTime || '3 min read',
        date: fm.date || '',
      });
    }
  }

  // Sort newest first
  searchData.sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2));
  console.log(`✅ search-data.json updated: ${searchData.length} articles written to ${outputPath}`);
}

generate();
