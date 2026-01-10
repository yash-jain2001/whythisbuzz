"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-6">
            <Mail className="w-6 h-6 text-accent" />
          </div>

          <h2 className="mb-4">Stay Informed, Not Overwhelmed</h2>

          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Get the week's most talked-about stories explained clearly.
            No clickbait, no bias—just context you can trust.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 text-accent animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-medium">You're subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Free weekly digest. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
