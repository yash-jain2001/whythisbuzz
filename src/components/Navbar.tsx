"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";

const categories = [
  { name: "Movies", href: "/#movies" },
  { name: "Celebrities", href: "/#celebrities" },
  { name: "Social Media", href: "/#social-media" },
  { name: "Controversies", href: "/#controversies" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
              WhyThisBuzz
            </span>
            <span className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold font-sans text-muted-foreground bg-muted tracking-wider uppercase">
              Explained
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {category.name}
              </a>
            ))}
          </div>

          {/* Search & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={category.href}
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
