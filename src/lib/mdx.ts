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
    seoTitle?: string;
    metaDescription?: string;
    keywords?: string; // string of comma separated keywords
}

export interface Article {
    metadata: ArticleMetadata;
    content: string;
}

// Helper to recursively find all MDX files
function getMdxFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getMdxFiles(filePath));
        } else if (file.endsWith('.mdx')) {
            results.push(filePath);
        }
    });
    return results;
}

export function getArticleSlugs() {
    const files = getMdxFiles(contentDirectory);
    return files.map(file => path.basename(file, '.mdx'));
}

export function getArticleBySlug(slug: string): Article | undefined {
    // Find the file that matches the slug
    const files = getMdxFiles(contentDirectory);
    const targetFile = files.find(file => path.basename(file, '.mdx') === slug);

    if (!targetFile) return undefined;

    try {
        const fileContents = fs.readFileSync(targetFile, 'utf8');
        const { data, content } = matter(fileContents);
        const realSlug = slug.replace(/\.mdx$/, '');

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

export function getAllCategories(): string[] {
    const categories = fs.readdirSync(contentDirectory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    return categories;
}

