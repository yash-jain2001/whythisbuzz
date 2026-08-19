/**
 * Article Image Validation & Category Consistency System for WhyThisBuzz
 */

import { CanonicalCategory, canonicalizeCategory } from './article-category';
import { getCategoryFallbackBanner } from './country-utils';

export interface ImageValidationResult {
  imageUrl: string;
  isValidOriginImage: boolean;
  isFallbackUsed: boolean;
  fallbackCategory?: CanonicalCategory;
  reason: string;
}

/**
 * Known placeholder / low-quality domain patterns to reject
 */
const BAD_IMAGE_PATTERNS = [
  'placeholder',
  'default-thumbnail',
  'default-article',
  'default-logo',
  'favicon',
  'googleusercontent.com',
  'gstatic.com',
  'google.com/news',
  'news.google.com',
  'photo-1611162617474-5b21e879e113', // Overused social media default photo
  'photo-1540910419892-4a36d2c3266c', // Overused ballot box photo
];

/**
 * Validate whether an image URL is a clean, original article photo
 */
export function isValidOriginImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) return false;

  for (const pattern of BAD_IMAGE_PATTERNS) {
    if (clean.includes(pattern)) return false;
  }

  return true;
}

/**
 * Process Article Image with Category Consistency Guarantee
 * Ensures that if a fallback image is needed, it strictly uses the FINAL canonical category!
 */
export function resolveArticleImage(input: {
  imageUrl?: string | null;
  category: CanonicalCategory | string;
  title: string;
}): ImageValidationResult {
  const { imageUrl, category, title } = input;
  const canonicalCat = canonicalizeCategory(category) || 'World Affairs';

  if (isValidOriginImageUrl(imageUrl)) {
    return {
      imageUrl: imageUrl!.trim(),
      isValidOriginImage: true,
      isFallbackUsed: false,
      reason: 'Valid origin article image preserved',
    };
  }

  // Generate category-consistent fallback image using the FINAL canonical category
  const fallbackUrl = getCategoryFallbackBanner(canonicalCat, title);

  return {
    imageUrl: fallbackUrl,
    isValidOriginImage: false,
    isFallbackUsed: true,
    fallbackCategory: canonicalCat,
    reason: `Missing/invalid origin image. Assigned category fallback banner for [${canonicalCat}]`,
  };
}
