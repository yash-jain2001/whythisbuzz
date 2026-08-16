import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import Script from "next/script"; // Added import for Script
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import PostHogProvider from "@/components/PostHogProvider";
import { OneSignalInit } from "@/components/OneSignalInit";
import { NotificationBell } from "@/components/NotificationBell";
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
    default: "Why This Buzz - Trending News Explained | WhyThisBuzz",
    template: "%s | Why This Buzz",
  },
  description: "Why This Buzz (WhyThisBuzz) explains why trending topics are buzzing — clear, in-depth news on Sports, Entertainment, Technology, and World Affairs. Fresh stories published daily.",
  keywords: ["Why This Buzz", "WhyThisBuzz", "why this buzz news", "trending news explained", "why is this trending", "digital culture", "technology news", "entertainment news", "sports news", "world affairs"],
  manifest: "/manifest.json",
  authors: [{ name: "Why This Buzz Editorial Team" }],
  creator: "Why This Buzz",
  publisher: "Why This Buzz",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://whythisbuzz.com",
    siteName: "WhyThisBuzz",
    title: "WhyThisBuzz - Trending News Explained",
    description: "WhyThisBuzz explains why trending topics are buzzing — clear, in-depth news on Sports, Entertainment, Technology, and World Affairs.",
    images: [
      {
        url: "https://whythisbuzz.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WhyThisBuzz - Trending News Explained",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@whythisbuzz",
    creator: "@whythisbuzz",
    title: "WhyThisBuzz - Trending News Explained",
    description: "Clear, in-depth explanations of why trending topics are buzzing. Fresh stories on Sports, Entertainment, Tech & more.",
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
    google: 'zxL9Ik25kYeG-uINIxPEVJwU0TeRoOPm-3Fh8LSunhc',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Import structured data utilities
  const { generateOrganizationSchema, generateWebsiteSchema, generateSiteNavigationSchema, generateJsonLd } = await import('@/lib/structured-data');

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  const navigationSchema = generateSiteNavigationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance Resource Hints */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* LLM Discovery */}
        <link rel="llms" href="https://whythisbuzz.com/llms.txt" />

        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7695332994037412"
          crossOrigin="anonymous"
        />

        {/* Google Reader Revenue Manager Script (Disabled for now)
        <script
          async
          type="application/javascript"
          src="https://news.google.com/swg/js/v1/swg-basic.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
                basicSubscriptions.init({
                  type: "NewsArticle",
                  isPartOfType: ["Product"],
                  isPartOfProductId: "CAow7L_HDA:openaccess",
                  clientOptions: { theme: "light", lang: "en" },
                });
              });
            `,
          }}
        />
        */}

        {/* JSON-LD Structured Data for Organization, Website and Navigation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateJsonLd(navigationSchema) }}
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

        {/* OneSignal Web Push Notifications */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <OneSignalInit />
        <NotificationBell />

        {/* Google AdSense Script */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        <PostHogProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
