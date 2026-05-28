import { ArticleMetadata } from './mdx';

const SITE_URL = 'https://whythisbuzz.com';
const SITE_NAME = 'WhyThisBuzz';
const SITE_LOGO = `${SITE_URL}/images/logo.png`;

/**
 * Generate Organization schema for the publisher
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: SITE_LOGO,
            width: 600,
            height: 60,
        },
        sameAs: [
            'https://x.com/whythisbuzz',
            'https://twitter.com/whythisbuzz',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            url: `${SITE_URL}/contact`,
        },
    };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Clear explanations of trending topics in technology, movies, entertainment, and digital culture.',
        publisher: generateOrganizationSchema(),
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Generate Article schema (NewsArticle) for article pages
 */
export function generateArticleSchema(
    article: ArticleMetadata,
    content: string
): object {
    const articleUrl = `${SITE_URL}/article/${article.id}`;
    const imageUrl = article.imageUrl || `${SITE_URL}/images/default-article.jpg`;

    // Extract first paragraph as description if summary is too short
    const description = article.summary || article.description || 'Read more on WhyThisBuzz';
    const authorName = article.author || 'WhyThisBuzz Editorial';

    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: description,
        image: {
            '@type': 'ImageObject',
            url: imageUrl,
            width: 1200,
            height: 630,
        },
        author: {
            '@type': authorName.includes('Editorial') || authorName.includes('Desk') ? 'Organization' : 'Person',
            name: authorName,
            url: authorName.includes('Editorial') || authorName.includes('Desk') ? SITE_URL : undefined,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: {
                '@type': 'ImageObject',
                url: SITE_LOGO,
                width: 600,
                height: 60,
            },
        },
        datePublished: new Date(article.date).toISOString(),
        dateModified: new Date(article.date).toISOString(), // Will be updated when lastModified is added
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
        },
        articleSection: article.category,
        keywords: [
            article.category,
            ...(article.keywords ? article.keywords.split(',').map(k => k.trim()) : []),
        ].join(', '),
        wordCount: content.trim().split(/\s+/).length,
        timeRequired: article.readTime,
        inLanguage: 'en-US',
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Generate CollectionPage schema for category pages
 */
export function generateCollectionPageSchema(
    category: string,
    articleCount: number
): object {
    const categoryUrl = `${SITE_URL}/category/${category.toLowerCase().replace(/\s+/g, '-')}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${category} Articles - ${SITE_NAME}`,
        description: `Browse all ${category.toLowerCase()} articles on ${SITE_NAME}`,
        url: categoryUrl,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
        },
        numberOfItems: articleCount,
    };
}

/**
 * Helper to generate JSON-LD script tag
 */
export function generateJsonLd(schema: object): string {
    return JSON.stringify(schema, null, 2);
}

/**
 * Generate multiple schemas combined
 */
export function generateCombinedSchema(...schemas: object[]): object {
    return {
        '@context': 'https://schema.org',
        '@graph': schemas.map(schema => {
            // Remove @context from individual schemas when combining
            const copy = { ...schema } as Record<string, unknown>;
            delete copy['@context'];
            return copy;
        }),
    };
}
