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

const newFiles = [
  'src/content/Social-Media/2026/08-August/2026-W33/holy-cow-why-this-bride-ditched-the-limo-for-her-favorite-bovine.mdx',
  'src/content/Social-Media/2026/08-August/2026-W33/why-this-tiny-german-town-is-betting-its-future-on-your-next-instagram-selfie.mdx',
  'src/content/Technology/2026/08-August/2026-W33/the-great-eclipse-glass-panic-why-your-sunglasses-wont-save-your-eyes-this-week.mdx',
  'src/content/Technology/2026/08-August/2026-W33/the-radar-renaissance-why-techs-oldest-sensor-is-suddenly-its-future.mdx',
  'src/content/World Affairs/2026/08-August/2026-W33/lockdowns-in-the-sky-why-airline-crews-are-no-longer-messing-around.mdx',
  'src/content/World Affairs/2026/08-August/2026-W33/volcanic-chaos-in-paradise-why-mount-etna-has-trapped-30000-tourists-in-sicily.mdx'
];

async function syncNew() {
  for (const rel of newFiles) {
    const fullPath = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    const slug = path.basename(rel, '.mdx');
    
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) continue;
    const fmStr = fmMatch[1];
    const body = content.slice(fmMatch[0].length).trim();

    const getVal = (key) => {
      const regex = new RegExp(`${key}:\\s*["']?(.*?)["']?$`, 'm');
      const m = fmStr.match(regex);
      return m ? m[1].replace(/^["']|["']$/g, '') : '';
    };

    const title = getVal('title') || slug;
    const summary = getVal('summary');
    const category = getVal('category') || 'World Affairs';
    const dateVal = getVal('date') || '2026-08-11';
    const imageUrl = getVal('imageUrl');
    const readTime = getVal('readTime') || '3 min read';
    const seoTitle = getVal('seoTitle') || title;
    const metaDescription = getVal('metaDescription') || summary;
    const keywords = getVal('keywords');

    const { error } = await supabase.from('articles').upsert({
      slug,
      title,
      summary,
      content: body,
      category,
      author: 'WhyThisBuzz Desk',
      date: dateVal,
      read_time: readTime,
      image_url: imageUrl,
      seo_title: seoTitle,
      meta_description: metaDescription,
      keywords
    }, { onConflict: 'slug' });

    if (error) console.error('❌ Failed to sync:', slug, error.message);
    else console.log('✅ Successfully synced new article to Supabase DB:', slug);
  }
}

syncNew();
