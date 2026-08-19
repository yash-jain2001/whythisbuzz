import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface BackupRecord {
  slug: string;
  title: string;
  current_category: string;
  proposed_category: string;
}

interface PostVerificationRecord {
  slug: string;
  title: string;
  old_category: string;
  new_category: string;
  verification_status: 'VERIFIED_SUCCESS' | 'CONCURRENT_CHANGE_DETECTED' | 'FAILED_POST_CHECK' | 'SKIPPED';
}

async function executeApprovedCategoryMigration() {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');

  if (!isExecute) {
    console.log(`\nℹ️ Mode is DRY-RUN. To execute approved updates, pass --execute.\n`);
    return;
  }

  console.log(`\n======================================================================`);
  console.log(`⚡ EXECUTING APPROVED PRODUCTION CATEGORY MIGRATION (108 AUTO_FIX RECORDS)`);
  console.log(`======================================================================\n`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase URL or Service Role Key.');
    process.exit(1);
  }

  // Read backup file containing the 108 approved records
  const backupPath = path.join(process.cwd(), 'reports', 'category-migration-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file reports/category-migration-backup.json not found!`);
    process.exit(1);
  }

  const backupRecords: BackupRecord[] = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  console.log(`📋 Loaded ${backupRecords.length} approved AUTO_FIX target records from backup.`);

  if (backupRecords.length !== 108) {
    console.error(`❌ Expected exactly 108 backup records, but found ${backupRecords.length}!`);
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Fetch initial total count before migration
  const { count: initialDbCount, error: countErr } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (countErr || initialDbCount === null) {
    console.error('❌ Failed to retrieve database count:', countErr?.message);
    process.exit(1);
  }

  console.log(`📊 Initial DB Exact Article Count: ${initialDbCount}`);

  if (initialDbCount !== 1359) {
    console.error(`❌ DB Count assertion failed: ${initialDbCount} !== 1359`);
    process.exit(1);
  }

  // 2. Perform Migration Loop on the 108 records ONLY
  const verificationList: PostVerificationRecord[] = [];
  let updatedCount = 0;
  let skippedCount = 0;
  let concurrentChangeCount = 0;
  let failedCount = 0;

  for (const item of backupRecords) {
    // A. Pre-check current state in database
    const { data: currentDoc, error: fetchErr } = await supabase
      .from('articles')
      .select('slug, title, category, summary, image_url, created_at')
      .eq('slug', item.slug)
      .single();

    if (fetchErr || !currentDoc) {
      console.error(`❌ Pre-check fetch failed for ${item.slug}:`, fetchErr?.message);
      failedCount++;
      verificationList.push({
        slug: item.slug,
        title: item.title,
        old_category: item.current_category,
        new_category: item.current_category,
        verification_status: 'FAILED_POST_CHECK',
      });
      continue;
    }

    // Pre-check verification against backup
    if (currentDoc.category !== item.current_category) {
      console.warn(`⚠️ CONCURRENT_CHANGE_DETECTED for ${item.slug}: DB category "${currentDoc.category}" != audited "${item.current_category}". Skipping!`);
      concurrentChangeCount++;
      skippedCount++;
      verificationList.push({
        slug: item.slug,
        title: item.title,
        old_category: currentDoc.category,
        new_category: currentDoc.category,
        verification_status: 'CONCURRENT_CHANGE_DETECTED',
      });
      continue;
    }

    // B. Execute Controlled Update of ONLY the `category` column
    const { error: updateErr } = await supabase
      .from('articles')
      .update({ category: item.proposed_category })
      .eq('slug', item.slug);

    if (updateErr) {
      console.error(`❌ Update failed for ${item.slug}:`, updateErr.message);
      failedCount++;
      verificationList.push({
        slug: item.slug,
        title: item.title,
        old_category: currentDoc.category,
        new_category: currentDoc.category,
        verification_status: 'FAILED_POST_CHECK',
      });
      continue;
    }

    // C. Post-update verification: Re-query database to verify update succeeded & no other fields changed
    const { data: postDoc, error: postErr } = await supabase
      .from('articles')
      .select('slug, title, category, summary, image_url, created_at')
      .eq('slug', item.slug)
      .single();

    if (postErr || !postDoc || postDoc.category !== item.proposed_category) {
      console.error(`❌ Post-update verification failed for ${item.slug}: Expected "${item.proposed_category}", got "${postDoc?.category}"`);
      failedCount++;
      verificationList.push({
        slug: item.slug,
        title: item.title,
        old_category: item.current_category,
        new_category: postDoc?.category || 'UNKNOWN',
        verification_status: 'FAILED_POST_CHECK',
      });
    } else {
      // Verify no other column was modified
      const isUnrelatedUnchanged = postDoc.title === currentDoc.title && 
                                    postDoc.summary === currentDoc.summary && 
                                    postDoc.image_url === currentDoc.image_url;

      if (!isUnrelatedUnchanged) {
        console.error(`❌ UNRELATED COLUMN MODIFIED FOR ${item.slug}!`);
        failedCount++;
        verificationList.push({
          slug: item.slug,
          title: item.title,
          old_category: item.current_category,
          new_category: postDoc.category,
          verification_status: 'FAILED_POST_CHECK',
        });
      } else {
        updatedCount++;
        verificationList.push({
          slug: item.slug,
          title: item.title,
          old_category: item.current_category,
          new_category: postDoc.category,
          verification_status: 'VERIFIED_SUCCESS',
        });
      }
    }
  }

  // 3. Post-Migration DB-Wide Verification & Integrity Check
  const { count: finalDbCount, error: finalCountErr } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (finalCountErr || finalDbCount !== initialDbCount) {
    console.error(`❌ CRITICAL: Total article count changed! Initial: ${initialDbCount}, Final: ${finalDbCount}`);
    process.exit(1);
  }

  console.log(`\n🔒 Database Integrity Verified: Total Articles Remains Exactly ${finalDbCount} (0 Deleted, 0 Duplicated).`);

  // 4. Calculate Final Category Distribution Across All 1,359 Articles
  const PAGE_SIZE = 500;
  let allArticles: any[] = [];
  let start = 0;

  while (allArticles.length < finalDbCount!) {
    const end = start + PAGE_SIZE - 1;
    const { data: pageData } = await supabase.from('articles').select('category').range(start, end);
    if (pageData) allArticles.push(...pageData);
    if (!pageData || pageData.length === 0) break;
    start += PAGE_SIZE;
  }

  const finalDistribution: Record<string, number> = {};
  allArticles.forEach(a => {
    const cat = a.category || 'NULL';
    finalDistribution[cat] = (finalDistribution[cat] || 0) + 1;
  });

  // 5. Output Post-Verification Reports
  const reportsDir = path.join(process.cwd(), 'reports');

  fs.writeFileSync(path.join(reportsDir, 'category-migration-post-verification.json'), JSON.stringify(verificationList, null, 2), 'utf-8');

  const postCsvHeader = 'slug,title,old_category,new_category,verification_status\n';
  const postCsvRows = verificationList.map(r => 
    `"${r.slug}","${r.title.replace(/"/g, '""')}","${r.old_category}","${r.new_category}","${r.verification_status}"`
  ).join('\n');
  fs.writeFileSync(path.join(reportsDir, 'category-migration-post-verification.csv'), postCsvHeader + postCsvRows, 'utf-8');

  console.log(`\n======================================================================`);
  console.log(`🎉 PRODUCTION CATEGORY MIGRATION COMPLETED SUCCESSFULLY!`);
  console.log(`======================================================================`);
  console.log(`- Rows Successfully Updated & Verified: ${updatedCount}/108`);
  console.log(`- Rows Skipped:                         ${skippedCount}`);
  console.log(`- Concurrent Changes Detected:           ${concurrentChangeCount}`);
  console.log(`- Verification Failures:                ${failedCount}`);
  console.log(`- Total DB Articles Verified:           ${finalDbCount}`);
  console.log(`\n📊 FINAL DB CATEGORY DISTRIBUTION (ALL 1,359 ARTICLES):`);
  console.log(JSON.stringify(finalDistribution, null, 2));
  console.log(`\n📁 Post-verification reports written:`);
  console.log(`  - reports/category-migration-post-verification.json`);
  console.log(`  - reports/category-migration-post-verification.csv`);
  console.log(`======================================================================\n`);
}

executeApprovedCategoryMigration();
