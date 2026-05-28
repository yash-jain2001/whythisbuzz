import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Cookie Policy - WhyThisBuzz",
    description: "Learn how WhyThisBuzz uses cookies and similar tracking technologies.",
    alternates: { canonical: 'https://whythisbuzz.com/cookies' },
    openGraph: { type: "website", url: "https://whythisbuzz.com/cookies", siteName: "WhyThisBuzz", title: "Cookie Policy - WhyThisBuzz" },
    robots: { index: true, follow: false },
};

export default function CookiesPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        Cookie Policy
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Last Updated: January 11, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">What Are Cookies?</h2>
                            <p>
                                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">How We Use Cookies</h2>
                            <p>WhyThisBuzz uses cookies for the following purposes:</p>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Essential Cookies</h3>
                            <p>
                                These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                            </p>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Analytics Cookies</h3>
                            <p>
                                We use analytics cookies to understand how visitors interact with our website. This helps us improve site performance and user experience. These cookies collect information anonymously.
                            </p>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Advertising Cookies</h3>
                            <p>
                                We use Google AdSense to display advertisements. These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Third-Party Cookies</h2>
                            <p>
                                Some cookies on WhyThisBuzz are set by third-party services:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Google AdSense:</strong> For displaying personalized advertisements</li>
                                <li><strong>Google Analytics:</strong> For tracking and analyzing site traffic</li>
                            </ul>
                            <p className="mt-4">
                                These third parties have their own privacy policies. We recommend reviewing:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Privacy Policy</a></li>
                                <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Advertising</a></li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Managing Cookies</h2>
                            <p>
                                You can control and/or delete cookies as you wish. You can delete all cookies that are already on your device and set most browsers to prevent them from being placed.
                            </p>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Browser Settings</h3>
                            <p>Most web browsers allow you to manage cookies through their settings:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Chrome</a></li>
                                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Firefox</a></li>
                                <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Safari</a></li>
                                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Edge</a></li>
                            </ul>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Opt-Out Options</h3>
                            <p>
                                To opt out of personalized advertising by Google, visit:
                                <br />
                                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                                    Google Ads Settings
                                </a>
                            </p>
                            <p className="mt-4">
                                Note: If you disable cookies, some parts of our website may not function properly.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Changes to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Contact</h2>
                            <p>
                                Questions about our use of cookies? Contact us at:
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
