import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxifyImage(url: string | string[] | unknown): string {
  if (!url) return '';

  let cleanUrl = '';
  if (Array.isArray(url)) {
    cleanUrl = url[0] || '';
  } else if (typeof url === 'string') {
    const trimmed = url.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cleanUrl = String(parsed[0]);
        }
      } catch {
        cleanUrl = trimmed;
      }
    } else {
      cleanUrl = trimmed;
    }
  }

  if (!cleanUrl || cleanUrl === '/images/placeholder.jpg' || cleanUrl === '/images/placeholder.svg') return '';
  
  // Extract clean HTTP/HTTPS URL if wrapped in quotes or brackets
  const match = cleanUrl.match(/https?:\/\/[^\s"',\]]+/);
  if (match) {
    return match[0];
  }

  return cleanUrl.startsWith('http') ? cleanUrl : '';
}
