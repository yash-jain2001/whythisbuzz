/**
 * Cloudflare Pages accepts at most 20,000 files per deployment. Next.js
 * emits an HTML document and several React payload files for every exported
 * article, so this leaves a deliberate safety margin below that limit.
 *
 * This value must be used by both the static article route and the sitemap:
 * never advertise a URL that has not been exported in the same deployment.
 */
export const MAX_STATIC_ARTICLES = 10000;
