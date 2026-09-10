import * as fs from 'fs';
import * as path from 'path';

const reportPath = path.resolve(__dirname, 'final_audit_report.json');
if (!fs.existsSync(reportPath)) {
  console.error('final_audit_report.json not found');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const safeMigrations = report.safeMigrations || [];
const legacyArticles = report.legacyArticles || [];
const allSafe = [...legacyArticles, ...safeMigrations];

// 1. Safe Migrations SQL
let sql = `-- SAFE MIGRATIONS SCRIPT (READ-ONLY FOR REVIEW - DO NOT EXECUTE AUTOMATICALLY)
-- Total Migrations: ${allSafe.length} (${legacyArticles.length} Legacy + ${safeMigrations.length} High-Confidence)
-- Generated on: ${new Date().toISOString()}

BEGIN;

`;

allSafe.forEach((item: any, idx: number) => {
  sql += `-- #${idx + 1}: ${item.title.replace(/'/g, "''")}\n`;
  sql += `-- Reason: ${item.reason}\n`;
  sql += `UPDATE articles SET category = '${item.newCategory}' WHERE id = '${item.id}';\n\n`;
});

sql += `COMMIT;\n`;

fs.writeFileSync(path.resolve(__dirname, 'safe_migrations.sql'), sql);
console.log(`Generated scratch/safe_migrations.sql with ${allSafe.length} statements.`);

// 2. Rollback SQL
let rollbackSql = `-- ROLLBACK SCRIPT FOR SAFE MIGRATIONS
-- Reverts ${allSafe.length} article categories back to original values
-- Generated on: ${new Date().toISOString()}

BEGIN;

`;

allSafe.forEach((item: any, idx: number) => {
  rollbackSql += `-- #${idx + 1}: Revert "${item.title.replace(/'/g, "''")}" back to '${item.oldCategory}'\n`;
  rollbackSql += `UPDATE articles SET category = '${item.oldCategory}' WHERE id = '${item.id}';\n\n`;
});

rollbackSql += `COMMIT;\n`;

fs.writeFileSync(path.resolve(__dirname, 'rollback_safe_migrations.sql'), rollbackSql);
console.log(`Generated scratch/rollback_safe_migrations.sql with ${allSafe.length} statements.`);

// 3. Verification SQL Query
const verifySql = `-- VERIFICATION QUERY: CATEGORY DISTRIBUTION AUDIT
-- Run before and after executing migrations to verify counts across canonical categories.

SELECT 
    category, 
    COUNT(*) as article_count 
FROM articles 
GROUP BY category 
ORDER BY article_count DESC;
`;

fs.writeFileSync(path.resolve(__dirname, 'verify_category_distribution.sql'), verifySql);
console.log('Generated scratch/verify_category_distribution.sql.');
