import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
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
  title: "WhyThisBuzz - Digital Culture Explained",
  description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
  openGraph: {
    title: "WhyThisBuzz - Digital Culture Explained",
    description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
    type: "website",
    locale: "en_US",
    siteName: "WhyThisBuzz",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhyThisBuzz - Digital Culture Explained",
    description: "Clear explanations of trending topics in technology, movies, entertainment, and digital culture.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${inter.variable} antialiased font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
