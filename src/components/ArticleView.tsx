"use client";

import { ArticleMetadata } from "@/lib/mdx";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Clock, Calendar, Link as LinkIcon, Bookmark, ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { FaWhatsapp, FaXTwitter, FaLinkedinIn, FaFacebookF } from "react-icons/fa6";
import { proxifyImage } from "@/lib/utils";
import { getArticleSeoImage } from "@/lib/country-utils";
import { AdBanner } from "@/components/AdBanner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface ArticleViewProps {
    article: ArticleMetadata & { content: React.ReactNode };
    relatedArticles: ArticleMetadata[];
    prevArticle?: ArticleMetadata;
    nextArticle?: ArticleMetadata;
}

export function ArticleView({ article, relatedArticles, prevArticle, nextArticle }: ArticleViewProps) {
    const [readProgress, setReadProgress] = useState(0);

    const seoImage = getArticleSeoImage(article);
    const targetSrc = proxifyImage(seoImage) || seoImage;
    const [failedUrl, setFailedUrl] = useState<string | null>(null);

    const imageSrc = (failedUrl === targetSrc) ? seoImage : targetSrc;

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
                        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                            <span className="category-tag inline-block">{article.category}</span>
                            {article.country && article.country.toUpperCase() !== 'GLOBAL' && (
                                <Link
                                    href={`/country/${article.country.toLowerCase()}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-colors border border-accent/20"
                                >
                                    <span>{article.countryFlag || (article.country.toUpperCase() === 'US' ? '🇺🇸' : article.country.toUpperCase() === 'GB' ? '🇬🇧' : '🌐')}</span>
                                    <span>{article.countryName || (article.country.toUpperCase() === 'US' ? 'United States' : article.country.toUpperCase() === 'GB' ? 'United Kingdom' : article.country)} Edition</span>
                                </Link>
                            )}
                        </div>

                        <h1 className="text-balance mb-6">{article.title}</h1>

                        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                            {article.summary}
                        </p>

                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                            <span className="font-medium text-foreground">{article.author}</span>
                            <time
                                dateTime={!isNaN(new Date(article.date).getTime()) ? new Date(article.date).toISOString() : undefined}
                                className="flex items-center gap-1.5"
                            >
                                <Calendar className="w-4 h-4" />
                                {article.date}
                            </time>
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
                                alt={article.title}
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

                        {/* E-E-A-T Author & Editorial Standards Card */}
                        <div className="my-10 p-6 rounded-2xl bg-muted/40 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 text-accent font-serif font-bold text-xl">
                                WB
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h4 className="font-serif font-bold text-base text-foreground">{article.author || 'WhyThisBuzz Editorial Desk'}</h4>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Verified Fact-Checked
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    WhyThisBuzz delivers objective, well-researched breakdowns of global trending topics, digital culture, and breaking news. Reviewed in accordance with our editorial accuracy standards.
                                </p>
                                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-accent">
                                    <Link href="/about" className="hover:underline">About Editorial Team</Link>
                                    <span>•</span>
                                    <Link href="/contact" className="hover:underline">Suggest Correction</Link>
                                    <span>•</span>
                                    <Link href="/disclaimer" className="hover:underline">Fact-Checking Policy</Link>
                                </div>
                            </div>
                        </div>

                        {/* Chronological Story Navigation (Doubly Linked List for Googlebot & Readers) */}
                        {(prevArticle || nextArticle) && (
                            <div className="my-10 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {prevArticle ? (
                                    <Link
                                        href={`/article/${prevArticle.id}`}
                                        className="group p-4 rounded-xl border border-border/70 hover:border-accent/40 bg-card hover:bg-secondary/40 transition-all flex flex-col justify-between"
                                    >
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5 font-medium">
                                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                            <span>Previous Story</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                                            {prevArticle.title}
                                        </h4>
                                    </Link>
                                ) : <div />}

                                {nextArticle ? (
                                    <Link
                                        href={`/article/${nextArticle.id}`}
                                        className="group p-4 rounded-xl border border-border/70 hover:border-accent/40 bg-card hover:bg-secondary/40 transition-all flex flex-col justify-between sm:text-right"
                                    >
                                        <div className="flex items-center sm:justify-end gap-1.5 text-xs text-muted-foreground mb-1.5 font-medium">
                                            <span>Next Story</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                                            {nextArticle.title}
                                        </h4>
                                    </Link>
                                ) : <div />}
                            </div>
                        )}
                    </div>
                </article>

                {/* Related Articles & Category Link */}
                <section className="py-12 bg-secondary/30 border-t border-border">
                    <div className="container max-w-6xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Related Explainers</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                More trending analysis and deep dives in {article.category || 'General'}
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {relatedArticles.map((relatedArticle) => (
                                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                            ))}
                        </div>

                        {/* Category & Archive Hub Links for Internal Link Equity */}
                        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                            <Link
                                href={`/category/${(article.category || 'general').toLowerCase().replace(/\s+/g, '-')}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all shadow-xs"
                            >
                                <span>Browse All {article.category} Stories</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/archive"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-secondary text-sm font-medium transition-all shadow-xs text-muted-foreground hover:text-foreground"
                            >
                                <span>View Full Story Archive</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
