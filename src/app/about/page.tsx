import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "About WhyThisBuzz - Trending News Explained",
    description: "Learn about WhyThisBuzz, your source for clear, unbiased explanations of viral trends, controversies, and digital culture.",
    keywords: ["about WhyThisBuzz", "trending news explainer", "digital culture news", "viral trends explained"],
    alternates: { canonical: 'https://www.whythisbuzz.com/about' },
    openGraph: {
        type: "website",
        url: "https://whythisbuzz.com/about",
        siteName: "WhyThisBuzz",
        title: "About WhyThisBuzz - Trending News Explained",
        description: "Learn about WhyThisBuzz, your source for clear explanations of viral trends and digital culture.",
        images: [{ url: "https://whythisbuzz.com/images/og-image.jpg", width: 1200, height: 630, alt: "About WhyThisBuzz" }],
    },
    twitter: {
        card: "summary_large_image",
        site: "@whythisbuzz",
        title: "About WhyThisBuzz",
        description: "Your source for clear explanations of trending news and digital culture.",
        images: ["https://whythisbuzz.com/images/og-image.jpg"],
    },
    robots: { index: true, follow: true },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        About WhyThisBuzz
                    </h1>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Your source for clear explanations of trending topics in tech, entertainment, and digital culture.
                        </p>

                        <section className="mt-12">
                            <h2 className="text-2xl font-serif font-bold mb-4">Our Mission</h2>
                            <p>
                                WhyThisBuzz explains trending topics in tech, entertainment, and digital culture. We break down complex stories into clear, easy-to-understand articles so you can stay informed about what's happening in the world.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">What We Cover</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Movies & Entertainment:</strong> Box office news, film releases, and cinema trends</li>
                                <li><strong>Technology:</strong> AI, software, gadgets, and developer tools</li>
                                <li><strong>Social Media:</strong> Platform updates, digital trends, and online culture</li>
                                <li><strong>Entertainment:</strong> Celebrity news, music, and pop culture</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Our Approach</h2>
                            <p>
                                We believe in clear, fact-based reporting. Every article is well-researched, cites sources, and presents information in an accessible way. Our goal is to inform and educate our readers.
                            </p>
                            <p className="mt-4">
                                No clickbait. No sensationalism. Just quality content that helps you understand the world better.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Contact Us</h2>
                            <p>
                                Have questions or feedback? We'd love to hear from you.
                                Visit our <a href="/contact" className="text-accent hover:underline">Contact page</a> to get in touch.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
