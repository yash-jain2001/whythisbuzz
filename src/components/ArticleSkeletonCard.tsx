'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function ArticleSkeletonCard() {
  return (
    <div className="h-full bg-card rounded-xl overflow-hidden shadow-editorial flex flex-col border border-border/40 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 left-3 z-10">
          <Skeleton className="w-16 h-5 rounded-full bg-background/50" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-4.5 flex flex-col gap-2.5 flex-1">
        <Skeleton className="h-5 w-4/5 rounded bg-muted/80" />
        <Skeleton className="h-5 w-3/5 rounded bg-muted/80" />
        
        <div className="space-y-1.5 mt-1">
          <Skeleton className="h-3.5 w-full rounded bg-muted/50" />
          <Skeleton className="h-3.5 w-3/4 rounded bg-muted/50" />
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <Skeleton className="h-3 w-16 rounded bg-muted/60" />
          <Skeleton className="h-2 w-2 rounded-full bg-muted/60" />
          <Skeleton className="h-3 w-12 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
