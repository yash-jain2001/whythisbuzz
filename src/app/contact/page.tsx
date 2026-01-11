import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Contact Us - WhyThisBuzz",
    description: "Get in touch with the WhyThisBuzz team. We'd love to hear your feedback, questions, or story suggestions.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        Contact Us
                    </h1>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We'd love to hear from you. Whether you have feedback, questions, or story suggestions, feel free to reach out.
                        </p>

                        <section className="mt-12">
                            <h2 className="text-2xl font-serif font-bold mb-4">Email Us</h2>
                            <p>
                                For general inquiries, feedback, or story submissions:
                                <br />
                                <a href="mailto:contact@whythisbuzz.com" className="text-accent hover:underline font-medium">
                                    contact@whythisbuzz.com
                                </a>
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Editorial Submissions</h2>
                            <p>
                                Have a trend or controversy you'd like us to explain? Send your suggestions to:
                                <br />
                                <a href="mailto:editorial@whythisbuzz.com" className="text-accent hover:underline font-medium">
                                    editorial@whythisbuzz.com
                                </a>
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Business Inquiries</h2>
                            <p>
                                For partnerships, advertising, or business opportunities:
                                <br />
                                <a href="mailto:business@whythisbuzz.com" className="text-accent hover:underline font-medium">
                                    business@whythisbuzz.com
                                </a>
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Response Time</h2>
                            <p>
                                We aim to respond to all inquiries within 48-72 hours. Thank you for your patience.
                            </p>
                        </section>

                        <section className="mt-8 bg-muted p-6 rounded-lg">
                            <h2 className="text-xl font-serif font-bold mb-3">Our Commitment</h2>
                            <p className="text-sm">
                                WhyThisBuzz is committed to neutral, fact-based reporting. We present multiple perspectives without taking sides. All content is carefully researched and cited.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
