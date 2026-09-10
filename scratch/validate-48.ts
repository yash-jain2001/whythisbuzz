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

const reportPath = path.resolve(__dirname, 'final_audit_report.json');
if (!fs.existsSync(reportPath)) {
  console.error('final_audit_report.json not found');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const safeMigrations = report.safeMigrations || [];
const legacyArticles = report.legacyArticles || [];
const targetIds = [...legacyArticles.map((a: any) => a.id), ...safeMigrations.map((a: any) => a.id)];

async function runValidation() {
  console.log(`Fetching ${targetIds.length} candidate articles from Supabase for deep inspection...`);

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, summary, content, category')
    .in('id', targetIds);

  if (error || !articles) {
    console.error('Error fetching target articles:', error);
    process.exit(1);
  }

  console.log(`Fetched ${articles.length} articles.`);

  const detailedList: any[] = [];

  for (const article of articles) {
    const isLegacy = article.category === 'World' || article.category === 'Movies';
    const classification = classifyArticle({
      title: article.title,
      summary: article.summary,
      content: article.content,
      sourceCategory: article.category,
    });

    detailedList.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: (article.summary || '').slice(0, 300),
      contentSnippet: (article.content || '').slice(0, 300),
      currentCategory: article.category,
      proposedCategory: classification.category,
      confidence: classification.confidence,
      method: classification.method,
      reason: classification.reason,
      signals: classification.matchedSignals,
      isLegacy,
    });
  }

  fs.writeFileSync(
    path.resolve(__dirname, 'detailed_48_validation.json'),
    JSON.stringify(detailedList, null, 2)
  );

  console.log('Saved detailed validation data to scratch/detailed_48_validation.json');
}

runValidation();
