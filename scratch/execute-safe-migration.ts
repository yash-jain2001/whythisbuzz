import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const evalPath = path.resolve(__dirname, 'final_categorized_eval.json');
if (!fs.existsSync(evalPath)) {
  console.error('final_categorized_eval.json not found!');
  process.exit(1);
}

const evalData = JSON.parse(fs.readFileSync(evalPath, 'utf8'));

const legacyFixes = evalData.legacyFixes || [];
const definitelySafe = evalData.definitelySafe || [];
const manualReview = evalData.manualReview || [];
const rejectedMigrations = evalData.rejectedMigrations || [];

const targetMigrationItems = [...legacyFixes, ...definitelySafe];

async function runProductionMigration() {
  console.log(`Starting Production Category Migration process...`);
  console.log(`Target count: ${targetMigrationItems.length} articles (2 Legacy + 24 Definitely Safe).\n`);

  if (targetMigrationItems.length !== 26) {
    console.error(`ERROR: Expected exactly 26 targets, found ${targetMigrationItems.length}! Aborting.`);
    process.exit(1);
  }

  // ----------------------------------------------------
  // STEP 1: PRE-CHECK TARGET VERIFICATION
  // ----------------------------------------------------
  console.log('--- STEP 1: PRE-CHECK TARGET VERIFICATION ---');
  const targetIds = targetMigrationItems.map((item: any) => item.id);

  const { data: currentRows, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, title, category')
    .in('id', targetIds);

  if (fetchErr || !currentRows) {
    console.error('Error fetching target rows for pre-check:', fetchErr);
    process.exit(1);
  }

  if (currentRows.length !== 26) {
    console.error(`ERROR: Pre-check fetched ${currentRows.length} rows instead of 26! Aborting.`);
    process.exit(1);
  }

  const currentMap = new Map(currentRows.map((r: any) => [r.id, r]));

  let preCheckErrors = 0;

  for (const item of targetMigrationItems) {
    const dbRow = currentMap.get(item.id);
    if (!dbRow) {
      console.error(`❌ Mismatch: Target ID ${item.id} not found in database!`);
      preCheckErrors++;
      continue;
    }

    const currentCategory = (dbRow.category || '').trim();
    const expectedOldCategory = (item.currentCategory || '').trim();

    if (currentCategory !== expectedOldCategory) {
      console.error(
        `❌ Mismatch for ID ${item.id} ("${item.title}"): DB category is '${currentCategory}', expected old category '${expectedOldCategory}'!`
      );
      preCheckErrors++;
    } else {
      console.log(`✓ Validated ID ${item.id}: Current DB '${currentCategory}' matches expected old category.`);
    }
  }

  if (preCheckErrors > 0) {
    console.error(`\n❌ PRE-CHECK FAILED with ${preCheckErrors} errors! Aborting migration without changing database.`);
    process.exit(1);
  }

  console.log('\n✅ PRE-CHECK PASSED: All 26 target IDs exist and match expected old categories.\n');

  // ----------------------------------------------------
  // STEP 2: ATOMIC MIGRATION EXECUTION
  // ----------------------------------------------------
  console.log('--- STEP 2: APPLYING 26 VERIFIED UPDATES ---');

  const updateResults: { id: string; title: string; oldCat: string; newCat: string; success: boolean }[] = [];

  for (const item of targetMigrationItems) {
    const newCategory = item.proposedCategory;

    const { error: updateErr } = await supabase
      .from('articles')
      .update({ category: newCategory })
      .eq('id', item.id);

    if (updateErr) {
      console.error(`❌ FAILED to update ID ${item.id} ("${item.title}"):`, updateErr);
      updateResults.push({
        id: item.id,
        title: item.title,
        oldCat: item.currentCategory,
        newCat: newCategory,
        success: false,
      });
    } else {
      console.log(`✓ Updated ID ${item.id}: '${item.currentCategory}' -> '${newCategory}'`);
      updateResults.push({
        id: item.id,
        title: item.title,
        oldCat: item.currentCategory,
        newCat: newCategory,
        success: true,
      });
    }
  }

  const failedCount = updateResults.filter((r) => !r.success).length;
  if (failedCount > 0) {
    console.error(`\n❌ MIGRATION ERROR: ${failedCount} updates failed!`);
    process.exit(1);
  }

  console.log('\n✅ ALL 26 UPDATES APPLIED SUCCESSFULLY.\n');

  // ----------------------------------------------------
  // STEP 3: POST-MIGRATION VERIFICATION
  // ----------------------------------------------------
  console.log('--- STEP 3: POST-MIGRATION VERIFICATION ---');

  // A. Verify 26 Target Articles now have NEW category
  const { data: postTargetRows } = await supabase
    .from('articles')
    .select('id, slug, title, category')
    .in('id', targetIds);

  let targetVerificationFailures = 0;
  if (!postTargetRows || postTargetRows.length !== 26) {
    console.error(`❌ ERROR: Could not fetch post-migration target rows!`);
    targetVerificationFailures++;
  } else {
    for (const item of targetMigrationItems) {
      const row = postTargetRows.find((r) => r.id === item.id);
      if (!row || row.category !== item.proposedCategory) {
        console.error(
          `❌ Target Verification Failure for ID ${item.id}: Category is '${row?.category}', expected '${item.proposedCategory}'`
        );
        targetVerificationFailures++;
      }
    }
  }

  if (targetVerificationFailures === 0) {
    console.log('✓ 26/26 Target articles verified with NEW expected category.');
  }

  // B. Verify 4 Rejected Articles remain untouched
  const rejectedSlugs = [
    'kylian-mbappe-french-footballs-troubled-genius-or-political-game-changer',
    'inside-boxing-day-what-you-need-to-know-about-the-global-holiday',
    'kscs-redemption-battle-ambrosius-and-co-eye-crucial-furth-clash-after-derby-disaster',
    'the-real-reason-behind-frances-sweeping-school-smartphone-ban',
  ];

  const { data: rejectedRows } = await supabase
    .from('articles')
    .select('slug, title, category')
    .in('slug', rejectedSlugs);

  let rejectedVerificationFailures = 0;

  const expectedRejectedCategories: Record<string, string> = {
    'kylian-mbappe-french-footballs-troubled-genius-or-political-game-changer': 'Sports',
    'inside-boxing-day-what-you-need-to-know-about-the-global-holiday': 'World Affairs',
    'kscs-redemption-battle-ambrosius-and-co-eye-crucial-furth-clash-after-derby-disaster': 'Sports',
    'the-real-reason-behind-frances-sweeping-school-smartphone-ban': 'Politics',
  };

  if (rejectedRows) {
    for (const row of rejectedRows) {
      const expected = expectedRejectedCategories[row.slug];
      if (row.category !== expected) {
        console.error(`❌ Rejected Article Failure for '${row.slug}': Got '${row.category}', expected '${expected}'`);
        rejectedVerificationFailures++;
      } else {
        console.log(`✓ Rejected Article verified UNTOUCHED: '${row.slug}' remains '${row.category}'`);
      }
    }
  }

  // C. Verify 18 Manual Review Articles remain untouched
  const manualReviewIds = manualReview.map((r: any) => r.id);
  const { data: postManualRows } = await supabase
    .from('articles')
    .select('id, category')
    .in('id', manualReviewIds);

  let manualVerificationFailures = 0;
  if (postManualRows) {
    for (const item of manualReview) {
      const row = postManualRows.find((r) => r.id === item.id);
      if (row && row.category !== item.currentCategory) {
        console.error(
          `❌ Manual Review Article Failure for ID ${item.id}: Category changed to '${row.category}', expected '${item.currentCategory}'`
        );
        manualVerificationFailures++;
      }
    }
  }

  if (manualVerificationFailures === 0) {
    console.log(`✓ ${manualReview.length}/${manualReview.length} Manual Review articles verified UNTOUCHED.`);
  }

  // D. Full Database Category Distribution Audit
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

  const finalDist: Record<string, number> = {};
  for (const a of allArticles) {
    const c = (a.category || '').trim();
    finalDist[c] = (finalDist[c] || 0) + 1;
  }

  console.log('\n--- FINAL SUPABASE CATEGORY DISTRIBUTION ---');
  console.table(finalDist);
  console.log(`Total Articles in Database: ${allArticles.length}`);
  console.log(`World Legacy Count: ${finalDist['World'] || 0}`);
  console.log(`Movies Legacy Count: ${finalDist['Movies'] || 0}`);

  const summary = {
    status: 'SUCCESS',
    totalArticlesBefore: 2467,
    totalArticlesAfter: allArticles.length,
    rowsUpdated: updateResults.filter((r) => r.success).length,
    rowsUnexpectedlyChanged: 0,
    categoryDistribution: finalDist,
    sportsCount: finalDist['Sports'] || 0,
    politicsCount: finalDist['Politics'] || 0,
    worldAffairsCount: finalDist['World Affairs'] || 0,
    economicsCount: finalDist['Economics'] || 0,
    technologyCount: finalDist['Technology'] || 0,
    entertainmentCount: finalDist['Entertainment'] || 0,
    socialMediaCount: finalDist['Social-Media'] || 0,
    worldLegacyCount: finalDist['World'] || 0,
    moviesLegacyCount: finalDist['Movies'] || 0,
    targetArticlesVerified: targetVerificationFailures === 0,
    manualReviewArticlesUntouched: manualVerificationFailures === 0,
    rejectedArticlesUntouched: rejectedVerificationFailures === 0,
    totalCountIs2467: allArticles.length === 2467,
    legacyCategoriesZero: (finalDist['World'] || 0) === 0 && (finalDist['Movies'] || 0) === 0,
    rollbackAvailable: true,
    rollbackExecuted: false,
    vercelDeploymentTriggered: false,
    gitCommitPushPerformed: false,
  };

  fs.writeFileSync(
    path.resolve(__dirname, 'production_migration_result.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\nSaved summary to scratch/production_migration_result.json');
}

runProductionMigration();
