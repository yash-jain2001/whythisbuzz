import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getAllArticles } from '@/lib/mdx';
import { Calendar, FileText, ChevronRight, Sparkles } from 'lucide-react';

export const revalidate = 3600; // Hourly ISR revalidation

export const metadata: Metadata = {
    title: 'News Archive & All Stories Directory | WhyThisBuzz',
    description: 'Complete chronological archive and directory of all news articles, trending topic explainers, and cultural analyses published by WhyThisBuzz.',
    keywords: ['WhyThisBuzz archive', 'news archive', 'all articles', 'trending news directory', 'WhyThisBuzz stories'],
    alternates: {
        canonical: 'https://www.whythisbuzz.com/archive',
        languages: {
            'en': 'https://www.whythisbuzz.com/archive',
            'en-US': 'https://www.whythisbuzz.com/archive',
            'en-GB': 'https://www.whythisbuzz.com/archive',
            'x-default': 'https://www.whythisbuzz.com/archive',
        },
    },
    openGraph: {
        type: 'website',
        url: 'https://www.whythisbuzz.com/archive',
        title: 'News Archive & All Stories Directory | WhyThisBuzz',
        description: 'Complete chronological archive and directory of all news articles and trending explainers published on WhyThisBuzz.',
        siteName: 'WhyThisBuzz',
        locale: 'en_US',
        images: [
            {
                url: 'https://www.whythisbuzz.com/images/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'WhyThisBuzz News Archive',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'News Archive & All Stories Directory | WhyThisBuzz',
        description: 'Complete chronological archive and directory of all articles published on WhyThisBuzz.',
        images: ['https://www.whythisbuzz.com/images/og-image.jpg'],
        site: '@whythisbuzz',
    },
    robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
    },
};

interface MonthGroup {
    key: string;
    label: string;
    year: number;
    articles: {
        id: string;
        title: string;
        category: string;
        date: string;
        country?: string;
    }[];
}

export default async function ArchivePage() {
    // Fetch all published articles to provide complete, crawlable link equity for Googlebot
    const allArticles = await getAllArticles(5000);

    // Group articles chronologically by Year & Month
    const groupsMap = new Map<string, MonthGroup>();

    for (const article of allArticles) {
        const dateObj = new Date(article.metadata.date);
        let year = 2026;
        let monthName = 'Recent';

        if (!isNaN(dateObj.getTime())) {
            year = dateObj.getFullYear();
            monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
        }

        const groupKey = `${year}-${monthName}`;

        if (!groupsMap.has(groupKey)) {
            groupsMap.set(groupKey, {
                key: groupKey,
                label: `${monthName} ${year}`,
                year,
                articles: [],
            });
        }

        groupsMap.get(groupKey)!.articles.push({
            id: article.metadata.id,
            title: article.metadata.title,
            category: article.metadata.category || 'General',
            date: article.metadata.date,
            country: article.metadata.country,
        });
    }

    const monthGroups = Array.from(groupsMap.values());

    // Structured data
    const { generateBreadcrumbSchema, generateCollectionPageSchema, generateJsonLd, generateCombinedSchema } = await import('@/lib/structured-data');
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://www.whythisbuzz.com' },
        { name: 'Archive', url: 'https://www.whythisbuzz.com/archive' },
    ]);
    const collectionSchema = generateCollectionPageSchema('All News Archive', allArticles.length);
    const combinedSchema = generateCombinedSchema(breadcrumbSchema, collectionSchema);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateJsonLd(combinedSchema) }}
            />

            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-1">
                    <div className="container mx-auto px-4 py-8 max-w-6xl">
                        {/* Breadcrumbs */}
                        <Breadcrumb
                            items={[
                                { name: 'Archive', url: '/archive' }
                            ]}
                        />

                        {/* Archive Header */}
                        <div className="mb-10 text-center sm:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent mb-3 border border-accent/20">
                                <FileText className="w-3.5 h-3.5" />
                                <span>Complete Crawlable Archive</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-foreground tracking-tight">
                                News & Story Archive
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                                Browse all <strong className="text-foreground">{allArticles.length.toLocaleString()}</strong> published stories, breaking reports, and cultural analyses across sports, politics, economics, technology, and entertainment.
                            </p>
                        </div>

                        {/* Quick Jump Links by Month */}
                        <div className="mb-12 p-5 rounded-2xl bg-secondary/50 border border-border/70 shadow-xs">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span>Jump to Month</span>
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {monthGroups.map((group) => (
                                    <a
                                        key={group.key}
                                        href={`#${group.key}`}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card hover:bg-accent hover:text-accent-foreground text-foreground border border-border/80 transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <span>{group.label}</span>
                                        <span className="text-[10px] opacity-70 bg-muted px-1.5 py-0.5 rounded-full font-mono">
                                            {group.articles.length}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Month by Month Article Lists */}
                        <div className="space-y-12">
                            {monthGroups.map((group) => (
                                <section
                                    key={group.key}
                                    id={group.key}
                                    className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs scroll-mt-24"
                                >
                                    <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/80">
                                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2.5">
                                            <span>{group.label}</span>
                                            <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60">
                                                {group.articles.length} articles
                                            </span>
                                        </h2>
                                        <a
                                            href="#top"
                                            className="text-xs text-muted-foreground hover:text-accent transition-colors hidden sm:block"
                                        >
                                            ↑ Back to Top
                                        </a>
                                    </div>

                                    {/* Article Grid / Links */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {group.articles.map((art) => (
                                            <Link
                                                key={art.id}
                                                href={`/article/${art.id}`}
                                                className="group p-3 sm:p-3.5 rounded-xl hover:bg-secondary/60 transition-all border border-transparent hover:border-border/70 flex items-start justify-between gap-3"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground flex-wrap">
                                                        <span className="font-semibold text-accent uppercase tracking-wider">
                                                            {art.category}
                                                        </span>
                                                        <span>·</span>
                                                        <span>{art.date}</span>
                                                        {art.country && art.country.toUpperCase() !== 'GLOBAL' && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="font-mono uppercase font-bold text-foreground">
                                                                    {art.country.toUpperCase() === 'US' ? '🇺🇸 US' : art.country.toUpperCase() === 'GB' ? '🇬🇧 UK' : art.country}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                                                        {art.title}
                                                    </h3>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
