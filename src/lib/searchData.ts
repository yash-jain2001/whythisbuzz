import fs from 'fs';
import path from 'path';
import { getAllArticles } from './mdx';

export async function generateSearchData() {
    const articles = await getAllArticles();
    const searchData = articles.map((article) => ({
        id: article.metadata.id,
        title: article.metadata.title,
        summary: article.metadata.summary,
        category: article.metadata.category,
        imageUrl: article.metadata.imageUrl,
        readTime: article.metadata.readTime,
    }));

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(publicDir, 'search-data.json'),
        JSON.stringify(searchData, null, 2)
    );
}
