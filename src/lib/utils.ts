import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxifyImage(url: string): string {
  if (!url || url === '/images/placeholder.jpg' || url === '/images/placeholder.svg') return '';
  if (!url.startsWith("http")) return url;
  
  // Return direct URL so the user's browser fetches directly from the image CDN
  return url;
}
