import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import Script from "next/script"; // Added import for Script
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://whythisbuzz.com'),
  title: {
    default: "WhyThisBuzz - Digital Culture Explained",
    template: "%s | WhyThisBuzz",
  },
  description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
  keywords: ["trending news", "digital culture", "technology", "entertainment", "movies", "social media", "explainer"],
  authors: [{ name: "WhyThisBuzz Editorial Team" }],
  creator: "WhyThisBuzz",
  publisher: "WhyThisBuzz",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whythisbuzz.com",
    siteName: "WhyThisBuzz",
    title: "WhyThisBuzz - Digital Culture Explained",
    description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
    images: [
      {
        url: "https://whythisbuzz.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WhyThisBuzz - Digital Culture Explained",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@whythisbuzz",
    creator: "@whythisbuzz",
    title: "WhyThisBuzz - Digital Culture Explained",
    description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
    images: ["https://whythisbuzz.com/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: 'verification-code-here',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Import structured data utilities
  const { generateOrganizationSchema, generateWebsiteSchema, generateJsonLd } = await import('@/lib/structured-data');

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        {/* Performance Resource Hints */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* JSON-LD Structured Data for Organization and Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(websiteSchema) }}
        />
      </head>
      <body
        className={`${merriweather.variable} ${inter.variable} antialiased font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5CFCSC1436"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5CFCSC1436');
          `}
        </Script>

        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
