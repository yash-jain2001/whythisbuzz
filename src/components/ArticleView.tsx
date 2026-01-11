"use client";

import { ArticleMetadata } from "@/lib/mdx";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ArticleViewProps {
    article: ArticleMetadata & { content: React.ReactNode };
    relatedArticles: ArticleMetadata[];
}

export function ArticleView({ article, relatedArticles }: ArticleViewProps) {
    const [readProgress, setReadProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadProgress(Math.min(progress, 100));
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.summary,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    if (!article) return null;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Reading progress bar */}
            <div
                className="reading-progress"
                style={{ width: `${readProgress}%` }}
            />

            <Navbar />

            <main className="flex-1">
                {/* Back link */}
                <div className="container pt-6">
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </a>
                </div>

                {/* Article Header */}
                <article className="container py-8 md:py-12">
                    <header className="max-w-3xl mx-auto text-center mb-10">
                        <span className="category-tag mb-4 inline-block">{article.category}</span>

                        <h1 className="text-balance mb-6">{article.title}</h1>

                        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                            {article.summary}
                        </p>

                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{article.author}</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {article.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
                            </span>
                        </div>
                    </header>

                    {/* Featured Image */}
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="aspect-[2/1] rounded-xl overflow-hidden">
                            <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="max-w-3xl mx-auto">
                        {/* Share buttons */}
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border">
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground/20 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>{copied ? "Copied Link!" : "Share"}</span>
                            </button>
                        </div>

                        {/* MDX Content */}
                        <div className="article-content prose prose-lg dark:prose-invert max-w-none">
                            {article.content}
                        </div>
                    </div>
                </article>

                {/* Related Articles */}
                <section className="py-12 bg-secondary/30 border-t border-border">
                    <div className="container">
                        <h2 className="mb-8 text-center">Related Explainers</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {relatedArticles.map((article) => (
                                <ArticleCard key={article.id} article={article as any} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer ad */}
                <div className="container py-10">
                    <div className="ad-slot h-32 max-w-4xl mx-auto">
                        <span>Advertisement</span>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
