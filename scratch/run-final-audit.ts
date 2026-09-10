import { createClient } from '@supabase/supabase-js';
import { classifyArticle, canonicalizeCategory } from '../src/lib/article-category';
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

async function runAudit() {
  console.log('Starting READ-ONLY audit of all Supabase articles...');

  let allArticles: any[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, summary, content, category')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching articles:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allArticles.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Fetched ${allArticles.length} total articles from Supabase.`);

  const currentCategoryDist: Record<string, number> = {};
  const safeMigrations: any[] = [];
  const manualReview: any[] = [];
  const alreadyCorrect: any[] = [];
  const legacyArticles: any[] = [];

  for (const article of allArticles) {
    const currentCat = article.category ? article.category.trim() : '';
    currentCategoryDist[currentCat] = (currentCategoryDist[currentCat] || 0) + 1;

    const isLegacy = currentCat === 'World' || currentCat === 'Movies';
    const canonicalCurrent = canonicalizeCategory(currentCat);

    const classification = classifyArticle({
      title: article.title,
      summary: article.summary,
      content: article.content,
      sourceCategory: currentCat,
    });

    const recommendedCat = classification.category;
    const confidence = classification.confidence;
    const method = classification.method;

    if (isLegacy) {
      legacyArticles.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        oldCategory: currentCat,
        newCategory: recommendedCat,
        confidence,
        reason: `Legacy non-canonical category "${currentCat}" mapped to "${recommendedCat}"`,
      });
      continue;
    }

    if (canonicalCurrent === recommendedCat) {
      alreadyCorrect.push(article);
      continue;
    }

    // Mismatch detected! Evaluate whether it is a SAFE MIGRATION or MANUAL REVIEW
    // Criteria for SAFE MIGRATION:
    // - Method is PRIMARY_SUBJECT or high confidence (>= 85%)
    // - Clear subject-level title evidence (e.g. title matched primary subject)
    // - No ambiguous signals
    const isSafe = (method === 'PRIMARY_SUBJECT' && confidence >= 85) || confidence >= 90;

    const migrationItem = {
      id: article.id,
      slug: article.slug,
      title: article.title,
      oldCategory: currentCat,
      newCategory: recommendedCat,
      confidence,
      method,
      reason: classification.reason,
      signals: classification.matchedSignals,
    };

    if (isSafe) {
      safeMigrations.push(migrationItem);
    } else {
      manualReview.push(migrationItem);
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total Articles Audited: ${allArticles.length}`);
  console.log('\nCurrent Database Category Distribution:');
  console.table(currentCategoryDist);

  console.log(`Already Correct: ${alreadyCorrect.length}`);
  console.log(`Legacy Category Articles (World / Movies): ${legacyArticles.length}`);
  console.log(`Safe Migrations Count: ${safeMigrations.length}`);
  console.log(`Manual Review Count: ${manualReview.length}`);

  // Write results to scratch json file
  const auditReport = {
    totalAudited: allArticles.length,
    currentCategoryDist,
    alreadyCorrectCount: alreadyCorrect.length,
    legacyCount: legacyArticles.length,
    legacyArticles,
    safeMigrationsCount: safeMigrations.length,
    safeMigrations,
    manualReviewCount: manualReview.length,
    manualReview,
  };

  fs.writeFileSync(
    path.resolve(__dirname, 'final_audit_report.json'),
    JSON.stringify(auditReport, null, 2)
  );

  console.log('\nSaved report to scratch/final_audit_report.json');
}

runAudit();
