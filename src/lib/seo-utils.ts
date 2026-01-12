/**
 * SEO utility functions for content optimization
 */

/**
 * Generate SEO-optimized meta description from content
 * @param content - The article content
 * @param maxLength - Maximum length (default 160)
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
    // Remove markdown syntax and extra whitespace
    const cleaned = content
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    // Take first sentence or truncate to maxLength
    const firstSentence = cleaned.split(/[.!?]/)[0];

    if (firstSentence.length <= maxLength) {
        return firstSentence;
    }

    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.substring(0, lastSpace) + '...';
}

/**
 * Extract keywords from title and content
 * @param title - Article title
 * @param content - Article content
 * @param limit - Maximum number of keywords
 */
export function extractKeywords(title: string, content: string, limit: number = 10): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i',
        'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when',
        'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
        'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
        'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'now',
    ]);

    // Combine title and first part of content
    const text = `${title} ${title} ${title} ${content.substring(0, 500)}`; // Title weighted 3x

    // Extract words
    const words = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequency
    const frequency = new Map<string, number>();
    words.forEach(word => {
        frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Sort by frequency and return top keywords
    return Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word);
}

/**
 * Validate and optimize title length for SEO
 * @param title - The title to validate
 * @param minLength - Minimum recommended length (default 30)
 * @param maxLength - Maximum recommended length (default 60)
 */
export function validateTitleLength(
    title: string,
    minLength: number = 30,
    maxLength: number = 60
): { valid: boolean; length: number; recommendation: string } {
    const length = title.length;

    if (length < minLength) {
        return {
            valid: false,
            length,
            recommendation: `Title too short. Consider adding more descriptive words (current: ${length}, recommended: ${minLength}-${maxLength})`,
        };
    }

    if (length > maxLength) {
        return {
            valid: false,
            length,
            recommendation: `Title too long. It may be truncated in search results (current: ${length}, recommended: ${minLength}-${maxLength})`,
        };
    }

    return {
        valid: true,
        length,
        recommendation: 'Title length is optimal for SEO',
    };
}

/**
 * Generate SEO-friendly URL slug from title
 * @param title - The title to convert
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Calculate accurate reading time
 * @param content - The article content
 * @param wordsPerMinute - Average reading speed (default 200)
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): string {
    // Remove markdown syntax
    const cleaned = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '') // Remove inline code
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\*\*/g, '') // Remove bold
        .replace(/\*/g, '') // Remove italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links, keep text

    const wordCount = cleaned.split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    return `${minutes} min read`;
}

/**
 * Optimize image alt text for SEO
 * @param title - Article or image title
 * @param context - Additional context
 */
export function generateImageAlt(title: string, context?: string): string {
    const base = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return context ? `${base} - ${context}` : base;
}

/**
 * Generate canonical URL
 * @param path - The page path
 * @param baseUrl - The base URL (default: whythisbuzz.com)
 */
export function generateCanonicalUrl(path: string, baseUrl: string = 'https://whythisbuzz.com'): string {
    // Remove trailing slash from baseUrl if present
    const cleanBase = baseUrl.replace(/\/$/, '');
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${cleanBase}${cleanPath}`;
}

/**
 * Extract focus keyword from title and content
 * @param title - Article title
 * @param content - Article content
 */
export function extractFocusKeyword(title: string, content: string): string {
    const keywords = extractKeywords(title, content, 1);
    return keywords[0] || '';
}

/**
 * Generate Open Graph title (optimized for social sharing)
 * @param title - Original title
 * @param maxLength - Maximum length (default 70 for optimal display)
 */
export function generateOgTitle(title: string, maxLength: number = 70): string {
    if (title.length <= maxLength) {
        return title;
    }

    // Truncate at word boundary
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    return truncated.substring(0, lastSpace) + '...';
}
