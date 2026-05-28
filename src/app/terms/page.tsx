import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Terms of Service - WhyThisBuzz",
    description: "Terms and conditions for using WhyThisBuzz.",
    alternates: { canonical: 'https://whythisbuzz.com/terms' },
    openGraph: { type: "website", url: "https://whythisbuzz.com/terms", siteName: "WhyThisBuzz", title: "Terms of Service - WhyThisBuzz" },
    robots: { index: true, follow: false },
};

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        Terms of Service
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Last Updated: January 11, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <p className="text-lg">
                            By accessing and using WhyThisBuzz, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our site.
                        </p>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Use of Content</h2>
                            <p>
                                All content on WhyThisBuzz, including text, images, graphics, and logos, is the property of WhyThisBuzz or its content suppliers and is protected by copyright and intellectual property laws.
                            </p>
                            <p className="mt-4">
                                You may view, download, and print pages from the site for personal, non-commercial use only. You may not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Republish content without permission</li>
                                <li>Sell, rent, or sub-license content</li>
                                <li>Reproduce or duplicate content for commercial purposes</li>
                                <li>Redistribute content (except via social sharing buttons)</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">User Conduct</h2>
                            <p>You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Use the site in any unlawful manner</li>
                                <li>Attempt to gain unauthorized access to any part of the site</li>
                                <li>Interfere with or disrupt the site or servers</li>
                                <li>Upload or transmit viruses or malicious code</li>
                                <li>Impersonate any person or entity</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Disclaimer of Warranties</h2>
                            <p>
                                WhyThisBuzz is provided "as is" without warranties of any kind, either express or implied. We do not warrant that:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The site will be uninterrupted or error-free</li>
                                <li>Defects will be corrected</li>
                                <li>The site is free of viruses or harmful components</li>
                                <li>Information on the site is accurate or complete</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by law, WhyThisBuzz shall not be liable for any damages arising from your use of or inability to use the site, including but not limited to direct, indirect, incidental, or consequential damages.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Third-Party Links</h2>
                            <p>
                                Our site may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of these sites. Clicking third-party links is at your own risk.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Advertising</h2>
                            <p>
                                WhyThisBuzz displays advertisements through third-party services like Google AdSense. We are not responsible for the content of advertisements or the practices of advertisers.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the site constitutes acceptance of the updated terms.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Contact</h2>
                            <p>
                                Questions about these Terms? Contact us at:
                                <br />
                                <a href="mailto:info.whythisbuzz@gmail.com" className="text-accent hover:underline font-medium">
                                    info.whythisbuzz@gmail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
