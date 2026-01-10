import Link from "next/link";

const footerLinks = {
  categories: [
    { name: "Movies", href: "/#movies" },
    { name: "Celebrities", href: "/#celebrities" },
    { name: "Social Media", href: "/#social-media" },
    { name: "Controversies", href: "/#controversies" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Editorial Policy", href: "/editorial-policy" },
    { name: "Contact", href: "/contact" },
    { name: "Careers", href: "/careers" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold">WhyThisBuzz</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              Clear, unbiased explanations of the stories everyone's talking about.
              No clickbait, no drama—just the context you need.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Categories
            </h4>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/50">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2026 WhyThisBuzz. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40 text-center md:text-right max-w-md">
            WhyThisBuzz is committed to neutral, fact-based reporting.
            We present multiple perspectives without taking sides.
          </p>
        </div>
      </div>
    </footer>
  );
}
