"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Flame, Rss, ArrowRight, Info, Mail, Archive } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Sports", href: "/category/sports" },
  { name: "World Affairs", href: "/category/world-affairs" },
  { name: "Politics", href: "/category/politics" },
  { name: "Economics", href: "/category/economics" },
  { name: "Technology", href: "/category/technology" },
  { name: "Social Media", href: "/category/social-media" },
  { name: "Movies & Entertainment", href: "/category/movies" },
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
          const searchLower = searchQuery.toLowerCase().trim();
          let results: any[] = [];

          if (supabase) {
            const { data } = await supabase
              .from('articles')
              .select('slug, title, summary, category, image_url, read_time, date')
              .or(`title.ilike.%${searchLower}%,summary.ilike.%${searchLower}%,category.ilike.%${searchLower}%`)
              .order('date', { ascending: false })
              .limit(10);

            if (data && data.length > 0) {
              results = data.map((doc: any) => ({
                id: doc.slug,
                title: doc.title,
                summary: doc.summary || '',
                category: doc.category,
                imageUrl: doc.image_url || '',
                readTime: doc.read_time || '3 min read',
                date: doc.date || '',
              }));
            }
          }

          if (results.length === 0) {
            const response = await fetch('/search-data.json');
            const fileArticles = await response.json();
            results = fileArticles.filter((article: any) => {
              return (
                article.title.toLowerCase().includes(searchLower) ||
                article.summary.toLowerCase().includes(searchLower) ||
                article.category.toLowerCase().includes(searchLower)
              );
            });
          }

          setSearchResults(results.slice(0, 15));
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
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
              WhyThisBuzz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Regional Edition Selector & Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Regional Editions Switcher */}
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/80 border border-border/80 text-xs font-medium">
              <span className="text-muted-foreground mr-1 text-[11px] uppercase tracking-wider">Edition:</span>
              <Link
                href="/country/us"
                className="px-2 py-0.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1 font-semibold"
                title="United States Edition - Breaking US News & Trends"
              >
                <span>🇺🇸</span>
                <span>US</span>
              </Link>
              <span className="text-border">·</span>
              <Link
                href="/country/gb"
                className="px-2 py-0.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1 font-semibold"
                title="United Kingdom Edition - Breaking UK News & Trends"
              >
                <span>🇬🇧</span>
                <span>UK</span>
              </Link>
              <span className="text-border">·</span>
              <Link
                href="/country/global"
                className="px-2 py-0.5 rounded-full hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1"
                title="Global Edition"
              >
                <span>🌐</span>
                <span>Global</span>
              </Link>
            </div>

            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
                <div>
                  <SheetHeader className="text-left pb-6 border-b border-border">
                    <SheetTitle className="font-serif text-2xl font-bold tracking-tight text-foreground">
                      WhyThisBuzz
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">Digital · Culture · Trends</p>
                  </SheetHeader>

                  {/* Mobile Regional Editions */}
                  <div className="py-4 border-b border-border/60">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-2.5">Regional Editions</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <Link
                        href="/country/us"
                        className="py-1.5 px-2 rounded-lg bg-secondary/80 hover:bg-accent hover:text-accent-foreground transition-all font-medium flex items-center justify-center gap-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>🇺🇸</span> US
                      </Link>
                      <Link
                        href="/country/gb"
                        className="py-1.5 px-2 rounded-lg bg-secondary/80 hover:bg-accent hover:text-accent-foreground transition-all font-medium flex items-center justify-center gap-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>🇬🇧</span> UK
                      </Link>
                      <Link
                        href="/country/global"
                        className="py-1.5 px-2 rounded-lg bg-secondary/80 hover:bg-accent hover:text-accent-foreground transition-all font-medium flex items-center justify-center gap-1"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>🌐</span> Global
                      </Link>
                    </div>
                  </div>

                  <div className="py-6 flex flex-col gap-4">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Categories</span>
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center justify-between text-base font-medium text-foreground/90 hover:text-accent transition-colors py-1.5"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{category.name}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">Quick Links</span>
                    <Link
                      href="/trending"
                      className="flex items-center gap-3 text-sm text-foreground/80 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Flame className="w-4 h-4 text-accent" />
                      <span>Trending Topics</span>
                    </Link>
                    <Link
                      href="/archive"
                      className="flex items-center gap-3 text-sm text-foreground/80 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Archive className="w-4 h-4 text-accent" />
                      <span>News Archive</span>
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-3 text-sm text-foreground/80 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Info className="w-4 h-4 text-accent" />
                      <span>About Us</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-3 text-sm text-foreground/80 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Mail className="w-4 h-4 text-accent" />
                      <span>Contact Us</span>
                    </Link>
                    <a
                      href="/feed.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-foreground/80 hover:text-accent transition-colors"
                    >
                      <Rss className="w-4 h-4 text-accent" />
                      <span>RSS Feed</span>
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-border text-center">
                  <p className="text-xs text-muted-foreground">© 2026 WhyThisBuzz</p>
                </div>
              </SheetContent>
            </Sheet>
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
              <div className="mt-3 max-h-[360px] overflow-y-auto pr-2 space-y-2">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.id}`}
                    className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 shrink-0">
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
                  </Link>
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
      </div>
    </nav>
  );
}
