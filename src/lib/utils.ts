import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxifyImage(url: string): string {
  if (!url || url === '/images/placeholder.jpg') return "/images/placeholder.svg";
  if (!url.startsWith("http")) return url;
  
  // In local development, fetch directly since Cloudflare Pages Functions do not run in next dev
  if (process.env.NODE_ENV !== "production") {
    return url;
  }
  
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}
