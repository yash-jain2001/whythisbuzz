"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { supabase, SupabaseArticleDoc } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ArticleView } from "@/components/ArticleView";
import { ArticleMetadata } from "@/lib/mdx";

function formatDateDisplay(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
}

export default function NotFound() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [articleData, setArticleData] = useState<{
        articleForView: ArticleMetadata & { content: React.ReactNode };
        relatedArticles: ArticleMetadata[];
    } | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchArticleFallback() {
            const fullPath = typeof window !== 'undefined' ? window.location.pathname : pathname || '';

            if (fullPath.includes('/article/') && supabase) {
                const rawSlug = fullPath.split('/article/')[1] || '';
                const cleanSlug = rawSlug.split('?')[0].split('#')[0].replace(/\/$/, '');

                if (cleanSlug) {
                    try {
                        const { data, error } = await supabase
                            .from('articles')
                            .select('*')
                            .eq('slug', cleanSlug)
                            .maybeSingle();

                        if (isMounted && !error && data) {
                            const doc = data as SupabaseArticleDoc;
                            const meta: ArticleMetadata = {
                                id: doc.slug,
                                title: doc.title,
                                description: doc.summary || doc.meta_description || '',
                                date: formatDateDisplay(doc.date),
                                author: doc.author || 'WhyThisBuzz Desk',
                                category: doc.category,
                                imageUrl: doc.image_url || '/images/default-thumbnail.png',
                                readTime: doc.read_time || '3 min read',
                                summary: doc.summary || '',
                                seoTitle: doc.seo_title,
                                metaDescription: doc.meta_description,
                                keywords: doc.keywords,
                            };

                            const htmlContent = renderMarkdown(doc.content || '');
                            const content = <MarkdownContent html={htmlContent} />;
                            const articleForView = {
                                ...meta,
                                content: content,
                            };

                            let related: ArticleMetadata[] = [];
                            const { data: relData } = await supabase
                                .from('articles')
                                .select('slug, title, summary, category, date, author, read_time, image_url, seo_title, meta_description, keywords')
                                .neq('slug', cleanSlug)
                                .limit(3);

                            if (relData) {
                                related = (relData as SupabaseArticleDoc[]).map((d) => ({
                                    id: d.slug,
                                    title: d.title,
                                    description: d.summary || d.meta_description || '',
                                    date: formatDateDisplay(d.date),
                                    author: d.author || 'WhyThisBuzz Desk',
                                    category: d.category,
                                    imageUrl: d.image_url || '/images/default-thumbnail.png',
                                    readTime: d.read_time || '3 min read',
                                    summary: d.summary || '',
                                } as ArticleMetadata));
                            }

                            if (isMounted) {
                                setArticleData({ articleForView, relatedArticles: related });
                                setLoading(false);
                                return;
                            }
                        }
                    } catch {
                        // ignore error
                    }
                }
            }

            if (isMounted) {
                setLoading(false);
            }
        }

        fetchArticleFallback();

        return () => {
            isMounted = false;
        };
    }, [pathname]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm font-medium">Loading article...</p>
                </div>
            </div>
        );
    }

    if (articleData) {
        return (
            <ArticleView
                article={articleData.articleForView}
                relatedArticles={articleData.relatedArticles}
            />
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <div className="text-center">
                <h1 className="mb-4 text-4xl font-bold">404</h1>
                <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
                <Link href="/" className="text-primary underline hover:text-primary/90">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

