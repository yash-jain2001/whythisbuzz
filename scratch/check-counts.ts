import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyCounts() {
  let allArticles: any[] = [];
  let p = 0;
  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('id, category')
      .range(p * 1000, (p + 1) * 1000 - 1);

    if (error || !data || data.length === 0) break;
    allArticles.push(...data);
    if (data.length < 1000) break;
    p++;
  }

  const counts: Record<string, number> = {};
  for (const a of allArticles) {
    const cat = (a.category || '').trim();
    counts[cat] = (counts[cat] || 0) + 1;
  }

  console.log('=== EXACT LIVE DATABASE CATEGORY COUNTS ===');
  console.log(`Total Articles: ${allArticles.length}`);
  console.log(`Sports: ${counts['Sports'] || 0}`);
  console.log(`World Affairs: ${counts['World Affairs'] || 0}`);
  console.log(`Entertainment: ${counts['Entertainment'] || 0}`);
  console.log(`Technology: ${counts['Technology'] || 0}`);
  console.log(`Politics: ${counts['Politics'] || 0}`);
  console.log(`Economics: ${counts['Economics'] || 0}`);
  console.log(`Social-Media: ${counts['Social-Media'] || 0}`);
  console.log(`World (Legacy): ${counts['World'] || 0}`);
  console.log(`Movies (Legacy): ${counts['Movies'] || 0}`);

  const sum =
    (counts['Sports'] || 0) +
    (counts['World Affairs'] || 0) +
    (counts['Entertainment'] || 0) +
    (counts['Technology'] || 0) +
    (counts['Politics'] || 0) +
    (counts['Economics'] || 0) +
    (counts['Social-Media'] || 0) +
    (counts['World'] || 0) +
    (counts['Movies'] || 0);

  console.log(`Sum of all category counts: ${sum}`);
}

verifyCounts();
