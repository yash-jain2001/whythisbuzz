"use client";

import { ArticleMetadata } from "@/lib/mdx";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Clock, Calendar, Link as LinkIcon, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaXTwitter, FaLinkedinIn, FaFacebookF } from "react-icons/fa6";
import { proxifyImage } from "@/lib/utils";
import { AdBanner } from "@/components/AdBanner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArticleViewProps {
    article: ArticleMetadata & { content: React.ReactNode };
    relatedArticles: ArticleMetadata[];
}

const DEFAULT_THUMBNAIL = "/images/default-thumbnail.png";

export function ArticleView({ article, relatedArticles }: ArticleViewProps) {
    const [readProgress, setReadProgress] = useState(0);

    const isBadImage = !article.imageUrl || article.imageUrl.includes('photo-1611162617474-5b21e879e113') || article.imageUrl.includes('placeholder');
    const targetSrc = isBadImage ? DEFAULT_THUMBNAIL : (proxifyImage(article.imageUrl) || DEFAULT_THUMBNAIL);
    const [failedUrl, setFailedUrl] = useState<string | null>(null);

    const imageSrc = (failedUrl === targetSrc) ? DEFAULT_THUMBNAIL : targetSrc;

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
                        <div className="relative flex w-full aspect-[16/9] md:aspect-[2/1] max-h-[60vh] rounded-xl overflow-hidden bg-muted/20">
                            <img
                                src={imageSrc}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={() => setFailedUrl(targetSrc)}
                            />
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="max-w-3xl mx-auto">
                        {/* Share buttons bar with Tooltips */}
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-border">
                            <TooltipProvider>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">Share:</span>
                                    
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={shareLinks.whatsapp}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-full bg-secondary/80 hover:bg-green-500/10 hover:text-green-600 transition-all border border-border"
                                                aria-label="Share on WhatsApp"
                                            >
                                                <FaWhatsapp className="w-4 h-4 text-green-600" />
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Share on WhatsApp</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={shareLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-full bg-secondary/80 hover:bg-accent/10 hover:text-accent transition-all border border-border"
                                                aria-label="Share on X"
                                            >
                                                <FaXTwitter className="w-4 h-4" />
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Share on X (Twitter)</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={shareLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-full bg-secondary/80 hover:bg-blue-600/10 hover:text-blue-600 transition-all border border-border"
                                                aria-label="Share on LinkedIn"
                                            >
                                                <FaLinkedinIn className="w-4 h-4 text-blue-600" />
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Share on LinkedIn</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={shareLinks.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 rounded-full bg-secondary/80 hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-border"
                                                aria-label="Share on Facebook"
                                            >
                                                <FaFacebookF className="w-4 h-4 text-blue-500" />
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>Share on Facebook</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopyLink}
                                                className="p-2.5 rounded-full bg-secondary/80 hover:bg-foreground/10 transition-all border border-border"
                                                aria-label="Copy Link"
                                            >
                                                <LinkIcon className="w-4 h-4 text-foreground" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy Article Link</TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleCopyLink}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-accent border border-border rounded-lg transition-colors"
                                        >
                                            <Bookmark className="w-3.5 h-3.5" />
                                            <span>Save Story</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy link to bookmark this story</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* MDX Content */}
                        <div className="article-content prose prose-lg dark:prose-invert max-w-none">
                            {article.content}
                        </div>

                        {/* AdSense Banner */}
                        <AdBanner className="my-8" />
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
            </main>

            <Footer />
        </div>
    );
}
