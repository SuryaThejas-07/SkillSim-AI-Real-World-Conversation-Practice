import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )}
  />
);

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

export const SkeletonCard = ({ count = 1, className }: SkeletonCardProps) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg border border-border p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="flex-1 h-8" />
          <Skeleton className="flex-1 h-8" />
        </div>
      </div>
    ))}
  </div>
);

interface SkeletonCharacterCardProps {
  count?: number;
}

export const SkeletonCharacterCard = ({ count = 3 }: SkeletonCharacterCardProps) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    ))}
  </div>
);

interface SkeletonStatsProps {
  count?: number;
}

export const SkeletonStats = ({ count = 4 }: SkeletonStatsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-lg border border-border p-6 space-y-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    ))}
  </div>
);

interface SkeletonChartProps {
  height?: string;
}

export const SkeletonChart = ({ height = "h-80" }: SkeletonChartProps) => (
  <div className={cn("rounded-lg border border-border p-6", height)}>
    <Skeleton className="h-full w-full" />
  </div>
);
