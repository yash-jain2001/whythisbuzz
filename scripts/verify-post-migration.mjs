import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function verifyMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch exact total count
  const { count, error } = await supabase.from('articles').select('*', { count: 'exact', head: true });
  console.log(`📊 DB Exact Total Article Count: ${count}`);

  // 2. Fetch all 1,359 articles paginated
  const PAGE_SIZE = 500;
  let allArticles = [];
  let start = 0;

  while (allArticles.length < count) {
    const end = start + PAGE_SIZE - 1;
    const { data: pageData } = await supabase.from('articles').select('slug, title, category, summary, image_url').range(start, end);
    if (pageData) allArticles.push(...pageData);
    if (!pageData || pageData.length === 0) break;
    start += PAGE_SIZE;
  }

  console.log(`✅ Retrieved all ${allArticles.length} articles from Supabase.`);

  // 3. Check target articles specifically
  const targetSlugs = [
    'why-sao-paulo-is-facing-a-massive-crisis-in-the-sul-americana',
    'why-robert-downey-jr-is-returning-as-iron-man-right-now',
    'the-real-reason-behind-duane-daviss-high-stakes-tupac-murder-trial',
    'inside-iphone-18-pro-what-you-need-to-know',
  ];

  console.log('\n--- TARGET ARTICLES POST-MIGRATION STATE ---');
  for (const slug of targetSlugs) {
    const found = allArticles.find(a => a.slug === slug);
    if (found) {
      console.log(`✓ [${found.category}] "${found.title}"`);
      console.log(`  Image: ${found.image_url}`);
    } else {
      console.error(`❌ Target slug missing: ${slug}`);
    }
  }

  // 4. Calculate Final Category Distribution Across All 1,359 Articles
  const distribution = {};
  allArticles.forEach(a => {
    const cat = a.category || 'NULL';
    distribution[cat] = (distribution[cat] || 0) + 1;
  });

  console.log('\n--- FINAL DB CATEGORY DISTRIBUTION (ALL 1,359 ARTICLES) ---');
  console.log(JSON.stringify(distribution, null, 2));

  // 5. Verify Backup comparison
  const backupPath = path.join(process.cwd(), 'reports', 'category-migration-backup.json');
  const backupRecords = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  let verifiedCount = 0;
  const postVerificationList = [];

  for (const b of backupRecords) {
    const doc = allArticles.find(a => a.slug === b.slug);
    if (doc && doc.category === b.proposed_category) {
      verifiedCount++;
      postVerificationList.push({
        slug: b.slug,
        title: b.title,
        old_category: b.current_category,
        new_category: doc.category,
        verification_status: 'VERIFIED_SUCCESS'
      });
    } else {
      console.error(`❌ Verification failed for ${b.slug}: Expected "${b.proposed_category}", got "${doc?.category}"`);
      postVerificationList.push({
        slug: b.slug,
        title: b.title,
        old_category: b.current_category,
        new_category: doc?.category || 'UNKNOWN',
        verification_status: 'FAILED_POST_CHECK'
      });
    }
  }

  console.log(`\n🎉 POST-MIGRATION VERIFICATION COMPLETE: ${verifiedCount}/${backupRecords.length} Target Records Verified with Proposed Category!`);

  // Write reports
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.writeFileSync(path.join(reportsDir, 'category-migration-post-verification.json'), JSON.stringify(postVerificationList, null, 2), 'utf-8');

  const postCsvHeader = 'slug,title,old_category,new_category,verification_status\n';
  const postCsvRows = postVerificationList.map(r => 
    `"${r.slug}","${r.title.replace(/"/g, '""')}","${r.old_category}","${r.new_category}","${r.verification_status}"`
  ).join('\n');
  fs.writeFileSync(path.join(reportsDir, 'category-migration-post-verification.csv'), postCsvHeader + postCsvRows, 'utf-8');

  console.log(`📁 Reports updated:`);
  console.log(`  - reports/category-migration-post-verification.json`);
  console.log(`  - reports/category-migration-post-verification.csv`);
}

verifyMigration();
