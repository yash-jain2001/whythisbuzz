import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function rollbackCategories() {
  console.log('🔄 STARTING CATEGORY MIGRATION ROLLBACK...');
  const backupPath = path.join(process.cwd(), 'reports', 'category-migration-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file category-migration-backup.json not found!');
    process.exit(1);
  }

  const backupData: Array<{ slug: string; current_category: string }> = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let restoredCount = 0;
  for (const item of backupData) {
    const { error } = await supabase.from('articles').update({ category: item.current_category }).eq('slug', item.slug);
    if (!error) restoredCount++;
    else console.error(`Failed to restore ${item.slug}:`, error.message);
  }

  console.log(`🎉 ROLLBACK COMPLETE: Restored ${restoredCount}/${backupData.length} articles to original categories.`);
}

// NOTE: DO NOT EXECUTE UNLESS EXPLICITLY INSTRUCTED
// rollbackCategories();
