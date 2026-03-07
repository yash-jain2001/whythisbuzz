"use client";

import { ArticleMetadata } from "@/lib/mdx";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Clock, Calendar, Share2, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaXTwitter, FaLinkedinIn, FaFacebookF } from "react-icons/fa6";
import Image from "next/image";

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

    const [showShareMenu, setShowShareMenu] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = encodeURIComponent(article.title);

    const shareLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        copy: shareUrl
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
            setShowShareMenu(false);
        } catch (err) {
            console.error('Failed to copy:', err);
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
                {/* Breadcrumb navigation */}
                <div className="container pt-6">
                    <Breadcrumb
                        items={[
                            {
                                name: article.category || 'General',
                                url: `/category/${(article.category || 'General').toLowerCase().replace(/\s+/g, '-')}`
                            },
                            {
                                name: article.title,
                                url: `/article/${article.id}`
                            },
                        ]}
                    />
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
                            <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="max-w-3xl mx-auto">
                        {/* Share buttons */}
                        <div className="relative mb-10 pb-6 border-b border-border">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground/20 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share Article</span>
                            </button>

                            {/* Share Menu Dropdown */}
                            {showShareMenu && (
                                <div className="absolute top-12 left-0 z-10 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px]">
                                    <a
                                        href={shareLinks.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                    >
                                        <FaWhatsapp className="w-4 h-4 text-green-600" />
                                        <span>WhatsApp</span>
                                    </a>
                                    <a
                                        href={shareLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                    >
                                        <FaXTwitter className="w-4 h-4" />
                                        <span>X (Twitter)</span>
                                    </a>
                                    <a
                                        href={shareLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                    >
                                        <FaLinkedinIn className="w-4 h-4 text-blue-600" />
                                        <span>LinkedIn</span>
                                    </a>
                                    <a
                                        href={shareLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                                    >
                                        <FaFacebookF className="w-4 h-4 text-blue-500" />
                                        <span>Facebook</span>
                                    </a>
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors w-full text-left"
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                        <span>Copy Link</span>
                                    </button>
                                </div>
                            )}
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
                            {relatedArticles.map((relatedArticle) => (
                                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
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
