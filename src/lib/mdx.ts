import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the content directory
const contentDirectory = path.join(process.cwd(), 'src/content');

export interface ArticleMetadata {
    id: string;
    title: string;
    description: string; // Mapped from 'summary' in frontmatter if needed, or 'description'
    date: string;
    author: string;
    category: string;
    imageUrl: string;
    readTime: string;
    summary: string; // Keeping 'summary' to match existing interface
}

export interface Article {
    metadata: ArticleMetadata;
    content: string;
}

export function getArticleSlugs() {
    return fs.readdirSync(contentDirectory);
}

export function getArticleBySlug(slug: string): Article | undefined {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(contentDirectory, `${realSlug}.mdx`);

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            metadata: {
                ...data,
                id: realSlug,
            } as ArticleMetadata,
            content,
        };
    } catch (e) {
        return undefined;
    }
}

export function getAllArticles(): Article[] {
    const slugs = getArticleSlugs();
    const articles = slugs
        .map((slug) => getArticleBySlug(slug))
        .filter((article): article is Article => article !== undefined)
        // Sort posts by date in descending order
        .sort((a, b) => (new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1));
    return articles;
}

export function getRelatedArticles(currentId: string, limit: number = 3): ArticleMetadata[] {
    const allArticles = getAllArticles();
    return allArticles
        .filter(article => article.metadata.id !== currentId)
        .map(article => article.metadata)
        .slice(0, limit);
}

export function getArticlesByCategory(category: string): ArticleMetadata[] {
    const allArticles = getAllArticles();
    return allArticles
        .map(article => article.metadata)
        .filter(article => article.category === category);
}
