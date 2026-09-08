import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = path.join(process.cwd(), 'out');
const sitemapPath = path.join(outputDirectory, 'sitemap.xml');
const MAX_CLOUDFLARE_SAFE_FILES = 19000;

function countFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce(
    (count, entry) => count + (entry.isDirectory()
      ? countFiles(path.join(directory, entry.name))
      : 1),
    0,
  );
}

if (!fs.existsSync(sitemapPath)) {
  console.error('Static export verification failed: out/sitemap.xml was not generated.');
  process.exit(1);
}

const outputFileCount = countFiles(outputDirectory);
if (outputFileCount > MAX_CLOUDFLARE_SAFE_FILES) {
  console.error(`Static export verification failed: ${outputFileCount} output files exceed the ${MAX_CLOUDFLARE_SAFE_FILES}-file safety limit for Cloudflare Pages.`);
  process.exit(1);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const articleLocations = [...sitemap.matchAll(/<loc>https:\/\/whythisbuzz\.com\/article\/([^<]+)<\/loc>/g)]
  .map((match) => decodeURIComponent(match[1]));

if (articleLocations.length > 1800) {
  console.error(`Static export verification failed: sitemap contains ${articleLocations.length} article URLs, exceeding the Cloudflare Pages-safe limit of 1800.`);
  process.exit(1);
}

const missing = articleLocations.filter((slug) => {
  const flatExport = path.join(outputDirectory, 'article', `${slug}.html`);
  const directoryExport = path.join(outputDirectory, 'article', slug, 'index.html');
  return !fs.existsSync(flatExport) && !fs.existsSync(directoryExport);
});

if (missing.length > 0) {
  console.error(`Static export verification failed: ${missing.length} sitemap article URL(s) have no HTML file.`);
  console.error(missing.slice(0, 20).map((slug) => `- /article/${slug}`).join('\n'));
  process.exit(1);
}

console.log(`Static export verified: ${articleLocations.length} sitemap article URL(s) have matching HTML files (${outputFileCount} total output files).`);
