/**
 * migrate-to-supabase.mjs
 * 
 * Bulk uploads all local MDX files from src/content to Supabase Database table 'articles'.
 * Run via: node scripts/migrate-to-supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
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
};

async function migrate() {
  console.log('🔍 Scanning local content directory...');
  const files = getMdxFiles(contentDir);
  console.log(`📄 Found ${files.length} MDX files to migrate to Supabase.`);

  let successCount = 0;
  let failCount = 0;

  // Process in batches of 20 to be super fast
  const BATCH_SIZE = 20;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batchFiles = files.slice(i, i + BATCH_SIZE);
    const records = [];

    for (const filePath of batchFiles) {
      const slug = path.basename(filePath, '.mdx');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, body } = parseFrontmatter(fileContent);

      if (!data.title || !data.category) continue;

      const imageUrl = data.imageUrl && !data.imageUrl.includes('placeholder')
        ? data.imageUrl
        : fallbackImages[data.category] || fallbackImages['World Affairs'];

      records.push({
        slug,
        title: data.title,
        summary: data.summary || data.description || '',
        content: body,
        category: data.category,
        author: data.author || 'WhyThisBuzz Desk',
        date: data.date || '',
        read_time: data.readTime || '3 min read',
        image_url: imageUrl,
        seo_title: data.seoTitle || null,
        meta_description: data.metaDescription || null,
        keywords: data.keywords || null,
      });
    }

    if (records.length > 0) {
      const { error } = await supabase
        .from('articles')
        .upsert(records, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Batch upload error at ${i}:`, error.message);
        failCount += records.length;
      } else {
        successCount += records.length;
        console.log(`✅ Uploaded ${successCount}/${files.length} articles to Supabase...`);
      }
    }
  }

  console.log(`\n🎉 Migration complete! ${successCount} uploaded successfully, ${failCount} failed.`);
}

migrate().catch(console.error);
