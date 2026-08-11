/**
 * generate-search-data.mjs
 * 
 * Standalone script to regenerate public/search-data.json.
 * Fetches from Supabase Database if credentials are set, or falls back to local files.
 * Run via: node scripts/generate-search-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const contentDir = path.join(__dirname, '..', 'src', 'content');
const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'search-data.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

  if (supabaseUrl && supabaseKey) {
    console.log('🌐 Fetching articles from Supabase Database for search-data.json...');
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('articles')
        .select('slug, title, summary, meta_description, category, image_url, read_time, date')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        for (const doc of data) {
          searchData.push({
            id: doc.slug,
            title: doc.title,
            summary: doc.summary || doc.meta_description || '',
            category: doc.category,
            imageUrl: doc.image_url || '',
            readTime: doc.read_time || '3 min read',
            date: doc.date || '',
          });
        }
        console.log(`✅ Fetched ${searchData.length} articles from Supabase in 1 batch.`);
      } else if (error) {
        console.warn('⚠️ Supabase fetch warning, falling back to local files:', error.message);
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch from Supabase, falling back to local files:', err.message);
    }
  }

  if (searchData.length === 0) {
    console.log('🔍 Scanning local content directory for search-data.json...');
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
