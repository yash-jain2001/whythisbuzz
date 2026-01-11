import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy - WhyThisBuzz",
    description: "Learn how WhyThisBuzz collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 py-16 md:py-24">
                <div className="container max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
                        Privacy Policy
                    </h1>

                    <p className="text-sm text-muted-foreground mb-8">
                        Last Updated: January 11, 2026
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <p className="text-lg">
                            WhyThisBuzz ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
                        </p>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Information We Collect</h2>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Automatically Collected Information</h3>
                            <p>When you visit WhyThisBuzz, we may automatically collect:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>IP address</li>
                                <li>Browser type and version</li>
                                <li>Operating system</li>
                                <li>Pages visited and time spent on pages</li>
                                <li>Referring website addresses</li>
                            </ul>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Information You Provide</h3>
                            <p>If you contact us or subscribe to our newsletter, you may provide:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Email address</li>
                                <li>Name (optional)</li>
                                <li>Message content</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">How We Use Your Information</h2>
                            <p>We use collected information to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide and improve our services</li>
                                <li>Analyze site usage and traffic patterns</li>
                                <li>Respond to your inquiries</li>
                                <li>Send newsletters (if you've subscribed)</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Cookies and Tracking Technologies</h2>
                            <p>
                                We use cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device. You can control cookie settings through your browser.
                            </p>
                            <p className="mt-4">
                                For more details, see our <a href="/cookies" className="text-accent hover:underline">Cookie Policy</a>.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Third-Party Services</h2>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Google AdSense</h3>
                            <p>
                                We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your visits to our site and other sites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Ads Settings</a>.
                            </p>

                            <h3 className="text-xl font-serif font-semibold mt-6 mb-3">Analytics</h3>
                            <p>
                                We may use analytics services (like Google Analytics) to understand how visitors interact with our site. These services may collect information about your device and browsing behavior.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Data Security</h2>
                            <p>
                                We implement reasonable security measures to protect your information. However, no internet transmission is completely secure. We cannot guarantee absolute security.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction or deletion of your information</li>
                                <li>Opt out of marketing communications</li>
                                <li>Disable cookies through your browser settings</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Children's Privacy</h2>
                            <p>
                                Our site is not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2 className="text-2xl font-serif font-bold mb-4">Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at:
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
