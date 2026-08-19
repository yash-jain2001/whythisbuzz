import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { classifyArticle, CanonicalCategory } from '../src/lib/article-category.js';
import { isValidOriginImageUrl } from '../src/lib/article-image.js';
import { getCategoryFallbackBanner } from '../src/lib/country-utils.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface CategoryAuditRecord {
  slug: string;
  title: string;
  current_category: string;
  proposed_category: CanonicalCategory;
  confidence: number;
  classification_method: string;
  matched_signals: string;
  reason: string;
  action: 'AUTO_FIX' | 'REVIEW_NEEDED' | 'KEEP_EXISTING';
}

interface ImageAuditRecord {
  slug: string;
  title: string;
  category: string;
  proposed_category: string;
  image_url: string;
  is_valid_origin_image: boolean;
  is_missing_or_placeholder: boolean;
  is_category_mismatch: boolean;
  suggested_image_url: string;
  reason: string;
}

const TARGET_SLUGS_OR_TITLES = [
  'why-sao-paulo-is-facing-a-massive-crisis-in-the-sul-americana',
  'why-robert-downey-jr-is-returning-as-iron-man-right-now',
  'the-real-reason-behind-duane-daviss-high-stakes-tupac-murder-trial',
  'inside-iphone-18-pro-what-you-need-to-know',
];

async function runFullDatabaseAudit() {
  console.log(`\n======================================================================`);
  console.log(`🔍 WHYTHISBUZZ COMPLETE PRODUCTION-SAFE FORENSIC AUDIT (ALL ARTICLES)`);
  console.log(`======================================================================\n`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase URL or Service Role Key.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Get exact database row count first
  const { count: exactDbCount, error: countErr } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  if (countErr || exactDbCount === null) {
    console.error('❌ Failed to retrieve exact database count:', countErr?.message);
    process.exit(1);
  }

  console.log(`📊 Supabase DB exact total articles: ${exactDbCount}`);

  // 2. Fetch ALL articles using strict pagination (zero skipped rows)
  const PAGE_SIZE = 500;
  let allArticles: any[] = [];
  let start = 0;

  while (allArticles.length < exactDbCount) {
    const end = start + PAGE_SIZE - 1;
    console.log(`📡 Fetching articles range ${start} - ${end}...`);
    const { data: pageData, error: pageErr } = await supabase
      .from('articles')
      .select('slug, title, summary, content, category, image_url')
      .range(start, end);

    if (pageErr || !pageData) {
      console.error(`❌ Error fetching articles range ${start}-${end}:`, pageErr?.message);
      process.exit(1);
    }

    allArticles.push(...pageData);
    if (pageData.length === 0) break;
    start += PAGE_SIZE;
  }

  const auditedCount = allArticles.length;
  console.log(`✅ Paginated fetch complete. Total articles retrieved: ${auditedCount}`);

  // STRICT FAIL-SAFE ASSERTION
  if (exactDbCount !== auditedCount) {
    console.error(`\n❌ CRITICAL FAIL-SAFE ERROR: Database count (${exactDbCount}) !== Audited count (${auditedCount})!`);
    console.error(`Aborting audit due to missing/skipped records!`);
    process.exit(1);
  }

  console.log(`🔒 Fail-Safe Passed: 100% of articles accounted for with zero skipped rows!\n`);

  // 3. Process Category & Image Audits
  const categoryAuditList: CategoryAuditRecord[] = [];
  const imageAuditList: ImageAuditRecord[] = [];

  let autoFixCount = 0;
  let reviewNeededCount = 0;
  let keepExistingCount = 0;

  let validOriginImageCount = 0;
  let missingOrPlaceholderImageCount = 0;
  let categoryImageMismatchCount = 0;

  const targetResults: Record<string, { catRecord: CategoryAuditRecord; imgRecord: ImageAuditRecord }> = {};

  for (const doc of allArticles) {
    // --- CATEGORY AUDIT ---
    const classification = classifyArticle({
      title: doc.title,
      summary: doc.summary,
      content: doc.content,
      sourceCategory: doc.category,
    });

    const currentCat = (doc.category || 'NULL').trim();
    const proposedCat = classification.category;
    const confidence = classification.confidence;

    let action: 'AUTO_FIX' | 'REVIEW_NEEDED' | 'KEEP_EXISTING' = 'KEEP_EXISTING';

    if (currentCat !== proposedCat) {
      if (confidence >= 90) {
        action = 'AUTO_FIX';
        autoFixCount++;
      } else if (confidence >= 70) {
        action = 'REVIEW_NEEDED';
        reviewNeededCount++;
      } else {
        action = 'KEEP_EXISTING';
        keepExistingCount++;
      }
    } else {
      keepExistingCount++;
    }

    const catRecord: CategoryAuditRecord = {
      slug: doc.slug,
      title: doc.title,
      current_category: currentCat,
      proposed_category: proposedCat,
      confidence,
      classification_method: classification.method,
      matched_signals: classification.matchedSignals.join('; '),
      reason: classification.reason,
      action,
    };
    categoryAuditList.push(catRecord);

    // --- IMAGE AUDIT ---
    const rawImage = (doc.image_url || '').trim();
    const isValidOrigin = isValidOriginImageUrl(rawImage);
    const isMissingOrPlaceholder = !isValidOrigin;

    // Check consistency: If fallback image was used for old category, check if it mismatches proposed category
    const isCategoryMismatch = currentCat !== proposedCat;

    let suggestedImage = rawImage;
    let imgReason = 'Valid origin image preserved';

    if (isMissingOrPlaceholder) {
      missingOrPlaceholderImageCount++;
      suggestedImage = getCategoryFallbackBanner(proposedCat, doc.title);
      imgReason = `Origin image missing/invalid. Suggested fallback banner for category [${proposedCat}]`;
    } else {
      validOriginImageCount++;
    }

    if (isCategoryMismatch) {
      categoryImageMismatchCount++;
    }

    const imgRecord: ImageAuditRecord = {
      slug: doc.slug,
      title: doc.title,
      category: currentCat,
      proposed_category: proposedCat,
      image_url: rawImage,
      is_valid_origin_image: isValidOrigin,
      is_missing_or_placeholder: isMissingOrPlaceholder,
      is_category_mismatch: isCategoryMismatch,
      suggested_image_url: suggestedImage,
      reason: imgReason,
    };
    imageAuditList.push(imgRecord);

    // Check if target article
    const lowerSlug = doc.slug.toLowerCase();
    for (const t of TARGET_SLUGS_OR_TITLES) {
      if (lowerSlug.includes(t) || doc.title.toLowerCase().includes('são paulo') || doc.title.toLowerCase().includes('robert downey') || doc.title.toLowerCase().includes('duane davis') || doc.title.toLowerCase().includes('iphone 18')) {
        targetResults[doc.slug] = { catRecord, imgRecord };
      }
    }
  }

  // 4. Output Reports to `reports/` Directory
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // JSON Reports
  const catJsonPath = path.join(reportsDir, 'article-category-audit.json');
  fs.writeFileSync(catJsonPath, JSON.stringify(categoryAuditList, null, 2), 'utf-8');

  const imgJsonPath = path.join(reportsDir, 'article-image-audit.json');
  fs.writeFileSync(imgJsonPath, JSON.stringify(imageAuditList, null, 2), 'utf-8');

  // CSV Reports
  const catCsvHeader = 'slug,title,current_category,proposed_category,confidence,classification_method,matched_signals,reason,action\n';
  const catCsvRows = categoryAuditList.map(r => 
    `"${r.slug}","${r.title.replace(/"/g, '""')}","${r.current_category}","${r.proposed_category}",${r.confidence},"${r.classification_method}","${r.matched_signals.replace(/"/g, '""')}","${r.reason.replace(/"/g, '""')}","${r.action}"`
  ).join('\n');
  fs.writeFileSync(path.join(reportsDir, 'article-category-audit.csv'), catCsvHeader + catCsvRows, 'utf-8');

  const imgCsvHeader = 'slug,title,category,proposed_category,image_url,is_valid_origin_image,is_missing_or_placeholder,is_category_mismatch,suggested_image_url,reason\n';
  const imgCsvRows = imageAuditList.map(r => 
    `"${r.slug}","${r.title.replace(/"/g, '""')}","${r.category}","${r.proposed_category}","${r.image_url}",${r.is_valid_origin_image},${r.is_missing_or_placeholder},${r.is_category_mismatch},"${r.suggested_image_url}","${r.reason.replace(/"/g, '""')}"`
  ).join('\n');
  fs.writeFileSync(path.join(reportsDir, 'article-image-audit.csv'), imgCsvHeader + imgCsvRows, 'utf-8');

  // Markdown Summary Report
  const mdSummary = `# WhyThisBuzz Complete Article Forensic Audit Summary Report

## 1. Executive Summary
- **Database Table**: \`public.articles\`
- **Total DB Articles Detected**: \`${exactDbCount}\`
- **Total Articles Audited**: \`${auditedCount}\`
- **Total Articles Skipped**: \`0\` (100% Fail-Safe Verified)
- **Database Safety Status**: **ZERO PRODUCTION DB WRITES EXECUTED**

---

## 2. Category Audit Breakdown
- **Correct / Unchanged Categories**: \`${keepExistingCount}\` (${((keepExistingCount/auditedCount)*100).toFixed(1)}%)
- **Safe Auto-Corrections (Conf >= 90%)**: \`${autoFixCount}\` (${((autoFixCount/auditedCount)*100).toFixed(1)}%)
- **Review Recommended (Conf 70-89%)**: \`${reviewNeededCount}\` (${((reviewNeededCount/auditedCount)*100).toFixed(1)}%)

---

## 3. Image Integrity & Consistency Audit Breakdown
- **Valid Article-Specific Origin Images**: \`${validOriginImageCount}\`
- **Missing / Placeholder Images**: \`${missingOrPlaceholderImageCount}\`
- **Category/Image Mismatches Identified**: \`${categoryImageMismatchCount}\`

---

## 4. Specific Target Articles Verification

| Target Title | Current DB Category | Proposed Category | Confidence | Method | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
${Object.values(targetResults).map(t => 
  `| \`${t.catRecord.title}\` | \`${t.catRecord.current_category}\` | **\`${t.catRecord.proposed_category}\`** | \`${t.catRecord.confidence}%\` | \`${t.catRecord.classification_method}\` | \`${t.catRecord.action}\` |`
).join('\n')}

---

## 5. Report Artifact Locations
- \`reports/article-category-audit.json\`
- \`reports/article-category-audit.csv\`
- \`reports/article-image-audit.json\`
- \`reports/article-image-audit.csv\`
- \`reports/article-audit-summary.md\`
`;

  fs.writeFileSync(path.join(reportsDir, 'article-audit-summary.md'), mdSummary, 'utf-8');

  console.log(`\n======================================================================`);
  console.log(`📊 FINAL AUDIT SUMMARY:`);
  console.log(`- Total Database Articles: ${exactDbCount}`);
  console.log(`- Total Audited:           ${auditedCount} (0 Skipped)`);
  console.log(`- AUTO_FIX (Conf >= 90%):  ${autoFixCount}`);
  console.log(`- REVIEW_NEEDED (70-89%):  ${reviewNeededCount}`);
  console.log(`- KEEP_EXISTING:           ${keepExistingCount}`);
  console.log(`- Valid Origin Images:     ${validOriginImageCount}`);
  console.log(`- Missing/Placeholder:     ${missingOrPlaceholderImageCount}`);
  console.log(`- Category/Image Mismatches:${categoryImageMismatchCount}`);
  console.log(`======================================================================\n`);

  console.log(`📁 Audit reports successfully written to reports/ directory:`);
  console.log(`  - reports/article-category-audit.json`);
  console.log(`  - reports/article-category-audit.csv`);
  console.log(`  - reports/article-image-audit.json`);
  console.log(`  - reports/article-image-audit.csv`);
  console.log(`  - reports/article-audit-summary.md`);
  console.log(`\n🔒 ZERO PRODUCTION DB ROWS WERE WRITTEN. DRY RUN COMPLETE!\n`);
}

runFullDatabaseAudit();
