import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "About WhyThisBuzz - Digital Culture Explained",
    description: "Learn about WhyThisBuzz, your source for clear, unbiased explanations of viral trends, controversies, and digital culture.",
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
                            Clear, unbiased explanations of the stories everyone's talking about.
                        </p>

                        <section className="mt-12">
                            <h2 className="text-2xl font-serif font-bold mb-4">Our Mission</h2>
                            <p>
                                WhyThisBuzz explains viral trends, controversies, and digital culture moments without the hype or bias. We break down complex stories into clear, fact-based explanations so you can understand what's happening and why it matters.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">What We Cover</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Movies & Entertainment:</strong> Box office trends, industry drama, and cinema news</li>
                                <li><strong>Social Media:</strong> Platform updates, viral moments, and digital culture</li>
                                <li><strong>Celebrities:</strong> Public figures in the news, explained fairly</li>
                                <li><strong>Technology:</strong> AI, frameworks, and developer tools</li>
                                <li><strong>Controversies:</strong> Both sides of debates, without taking sides</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Our Approach</h2>
                            <p>
                                We believe in neutral, fact-based reporting. Every article presents multiple perspectives, cites sources, and avoids clickbait. Our goal is to inform, not influence.
                            </p>
                            <p className="mt-4">
                                No hot takes. No drama. Just context, clarity, and the facts you need.
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
