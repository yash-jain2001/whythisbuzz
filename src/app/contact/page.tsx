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
                                For general inquiries, feedback, editorial submissions, or business opportunities, please email us at:
                                <br />
                                <a href="mailto:info.whythisbuzz@gmail.com" className="text-accent hover:underline font-medium">
                                    info.whythisbuzz@gmail.com
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
                                WhyThisBuzz is dedicated to providing clear, accurate, and engaging content about the latest trends in technology, entertainment, and digital culture. Our content is carefully researched to keep you informed.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
