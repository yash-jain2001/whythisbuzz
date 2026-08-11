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
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

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

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { fm: {}, body: fileContent };

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
  return { fm, body };
}

async function syncAll() {
  const contentDir = path.join(__dirname, '..', 'src', 'content');
  const files = getMdxFiles(contentDir);
  console.log(`📂 Found total ${files.length} MDX files`);

  let synced = 0;
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { fm, body } = parseFrontmatter(content);
    if (!fm.title || !fm.category) continue;

    const slug = path.basename(filePath, '.mdx');
    const dateVal = fm.date || new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('articles').upsert({
      slug,
      title: fm.title,
      summary: fm.summary || fm.description || '',
      content: body,
      category: fm.category,
      author: fm.author || 'WhyThisBuzz Desk',
      date: dateVal,
      read_time: fm.readTime || '3 min read',
      image_url: fm.imageUrl || '',
      seo_title: fm.seoTitle || fm.title,
      meta_description: fm.metaDescription || fm.summary || '',
      keywords: fm.keywords || ''
    }, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Failed to sync ${slug}:`, error.message);
    } else {
      synced++;
    }
  }
  console.log(`✅ Successfully synced ${synced} articles to Supabase Database!`);
}

syncAll();
