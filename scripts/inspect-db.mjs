import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function inspectDb() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const keywords = ['São Paulo', 'Robert Downey', 'Duane Davis', 'iPhone 18', 'Iron Man'];
  
  console.log('--- SPECIFIC ARTICLES IN DATABASE ---');
  for (const kw of keywords) {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, summary, category, image_url')
      .ilike('title', `%${kw}%`);
      
    if (error) {
      console.error(`Error searching for ${kw}:`, error);
    } else {
      console.log(`\nQuery for "${kw}": (${data?.length || 0} found)`);
      data?.forEach(row => {
        console.log(`Title: ${row.title}`);
        console.log(`Slug: ${row.slug}`);
        console.log(`DB Category: "${row.category}"`);
        console.log(`Image URL: ${row.image_url}`);
      });
    }
  }

  console.log('\n--- CATEGORY DISTRIBUTION IN DB ---');
  const { data: allArticles, error: allErr } = await supabase.from('articles').select('slug, title, category, summary');
  if (allErr) {
    console.error('Error fetching all articles:', allErr);
    return;
  }
  
  const counts = {};
  allArticles?.forEach(a => {
    const cat = a.category || 'NULL/EMPTY';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  console.log('Total articles:', allArticles?.length);
  console.log('Category breakdown:', JSON.stringify(counts, null, 2));

  console.log('\n--- SAMPLE 15 ARTICLES ---');
  allArticles?.slice(0, 15).forEach(a => {
    console.log(`[DB Category: "${a.category}"] Title: "${a.title}"`);
  });
}

inspectDb();
