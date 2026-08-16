'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function ArticleSkeletonCard() {
  return (
    <div className="h-full bg-card rounded-xl overflow-hidden shadow-editorial flex flex-col border border-border/40 shimmer-wave">
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-muted/80 shimmer-wave">
        <Skeleton className="w-full h-full bg-muted/70" />
        <div className="absolute top-3 left-3 z-10">
          <Skeleton className="w-16 h-5 rounded-full bg-background/60" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-4.5 flex flex-col gap-2.5 flex-1">
        <Skeleton className="h-4 w-24 rounded bg-muted/60" />
        <Skeleton className="h-5 w-full rounded bg-muted/80" />
        <Skeleton className="h-5 w-4/5 rounded bg-muted/80" />
        
        <div className="space-y-1.5 mt-1">
          <Skeleton className="h-3.5 w-full rounded bg-muted/50" />
          <Skeleton className="h-3.5 w-3/4 rounded bg-muted/50" />
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
          <Skeleton className="h-3 w-16 rounded bg-muted/60" />
          <Skeleton className="h-3 w-12 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
