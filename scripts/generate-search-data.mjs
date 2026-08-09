/**
 * generate-search-data.mjs
 * 
 * Standalone script to regenerate public/search-data.json from all MDX files.
 * Run via: node scripts/generate-search-data.mjs
 * Also hooked as `prebuild` in package.json so Cloudflare Pages auto-runs it.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');
const publicDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(publicDir, 'search-data.json');

// Simple frontmatter parser — no dependencies required
function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip surrounding quotes
    value = value.replace(/^["']|["']$/g, '');
    fm[key] = value;
  }
  return fm;
}

function getMdxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getMdxFiles(filePath));
    } else if (file.endsWith('.mdx')) {
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

console.log('🔍 Scanning content directory...');
const files = getMdxFiles(contentDir);
console.log(`📄 Found ${files.length} MDX files`);

const searchData = [];

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

// Sort newest first (by date string — works for "Jul 5, 2026" format)
searchData.sort((a, b) => {
  const da = new Date(a.date).getTime() || 0;
  const db = new Date(b.date).getTime() || 0;
  return db - da;
});

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2));
console.log(`✅ search-data.json updated: ${searchData.length} articles written to ${outputPath}`);

// Hack to fix Next.js static cache on Cloudflare Pages
// By "touching" mdx.ts, we trick Webpack into thinking the file changed.
// Next.js will invalidate the cache for any page importing it (like the Home page)
// while keeping the compiled cache for all the 900+ older articles!
const mdxPath = path.join(__dirname, '..', 'src', 'lib', 'mdx.ts');
if (fs.existsSync(mdxPath)) {
  const now = new Date();
  fs.utimesSync(mdxPath, now, now);
  console.log('🔄 Touched src/lib/mdx.ts to force Next.js cache invalidation');
}
