import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { normalizeCategory } from '../src/lib/country-utils.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function fixDbCategories() {
  console.log('🔍 Connecting to Supabase database to optimize article categories...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('articles').select('slug, title, summary, category');

  if (error || !data) {
    console.error('❌ Failed to fetch database articles:', error?.message);
    return;
  }

  console.log(`📌 Inspecting ${data.length} database rows...`);
  let fixedCount = 0;

  for (const doc of data) {
    const correctCat = normalizeCategory(doc.title, doc.summary, doc.category);
    if (correctCat !== doc.category) {
      console.log(`Fixing category for: "${doc.title.substring(0, 45)}" -> [${doc.category}] => [${correctCat}]`);
      await supabase.from('articles').update({ category: correctCat }).eq('slug', doc.slug);
      fixedCount++;
    }
  }

  console.log(`\n🎉 DATABASE CATEGORIES CLEANUP COMPLETE! Fixed ${fixedCount} misclassified articles!`);
}

fixDbCategories();
