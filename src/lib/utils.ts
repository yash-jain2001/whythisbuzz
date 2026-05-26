import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxifyImage(url: string): string {
  if (!url) return "/images/placeholder.jpg";
  if (!url.startsWith("http")) return url;
  
  // If running locally, fetch directly to avoid needing Pages functions emulation in simple dev mode
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return url;
  }
  
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
