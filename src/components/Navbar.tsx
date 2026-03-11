"use client";

import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";

import Image from "next/image";

const categories = [
  { name: "Sports", href: "/#sports" },
  { name: "World Affairs", href: "/#world-affairs" },
  { name: "Technology", href: "/#technology" },
  { name: "Social Media", href: "/#social-media" },
  { name: "Movies & Entertainment", href: "/#movies" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Filter articles based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const fetchResults = async () => {
        try {
          const response = await fetch('/search-data.json');
          const allArticles = await response.json();

          const searchLower = searchQuery.toLowerCase();
          const filtered = allArticles.filter((article: any) => {
            return (
              article.title.toLowerCase().includes(searchLower) ||
              article.summary.toLowerCase().includes(searchLower) ||
              article.category.toLowerCase().includes(searchLower)
            );
          }).slice(0, 5);

          setSearchResults(filtered);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      };
      fetchResults();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
              WhyThisBuzz
            </span>
          </a>

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
              onClick={() => setIsSearchOpen(!isSearchOpen)}
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

        {/* Search Dropdown */}
        {isSearchOpen && (
          <div className="py-4 border-t border-border animate-fade-in">
            <input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              autoFocus
            />

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((article) => (
                  <a
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {article.category} · {article.readTime}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground text-center py-4">
                No articles found for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        )}

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
