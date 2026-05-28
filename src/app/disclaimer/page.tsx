import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Disclaimer - WhyThisBuzz",
    description: "Important disclaimers about WhyThisBuzz content and information accuracy.",
    alternates: { canonical: 'https://whythisbuzz.com/disclaimer' },
    openGraph: { type: "website", url: "https://whythisbuzz.com/disclaimer", siteName: "WhyThisBuzz", title: "Disclaimer - WhyThisBuzz" },
    robots: { index: true, follow: false },
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        Disclaimer
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Last Updated: January 11, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">General Information</h2>
                            <p>
                                The information provided on WhyThisBuzz is for general informational and educational purposes only. All content is provided in good faith; however, we make no representation or warranty of any kind regarding the accuracy, adequacy, validity, reliability, or completeness of any information on the site.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">No Professional Advice</h2>
                            <p>
                                The content on WhyThisBuzz does not constitute professional advice (legal, financial, medical, or otherwise). You should not rely on the information as a substitute for professional consultation. Always seek the advice of qualified professionals with any questions you may have.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">External Links Disclaimer</h2>
                            <p>
                                WhyThisBuzz may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, or completeness of any information on these external sites. Links are provided for convenience only and do not signify endorsement.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Errors and Omissions</h2>
                            <p>
                                While we strive to provide accurate and up-to-date information, WhyThisBuzz makes no warranties about the completeness, reliability, or accuracy of this information. Any action you take based on the information on this website is strictly at your own risk.
                            </p>
                            <p className="mt-4">
                                We reserve the right to make additions, deletions, or modifications to the contents of the site at any time without prior notice.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Content and Opinions</h2>
                            <p>
                                Articles on WhyThisBuzz are informational and educational. Views expressed are for informational purposes and do not necessarily reflect the official position of WhyThisBuzz.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Third-Party Content</h2>
                            <p>
                                Our site may include content from third parties, including user comments, embedded media, and advertisements. We are not responsible for the accuracy or legality of third-party content.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Fair Use</h2>
                            <p>
                                WhyThisBuzz may use copyrighted material under "fair use" for purposes of commentary, criticism, news reporting, and education. If you believe any content infringes your copyright, please contact us.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Consent</h2>
                            <p>
                                By using WhyThisBuzz, you consent to this disclaimer and agree to its terms.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Contact</h2>
                            <p>
                                If you have questions or concerns about this disclaimer, contact us at:
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
