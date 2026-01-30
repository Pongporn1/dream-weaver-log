import { Skeleton } from "@/components/ui/skeleton";
import { DreamCardSkeleton } from "./DreamCardSkeleton";

export function HomeSkeleton() {
  return (
    <div className="space-y-8 py-4">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Quick Entry */}
      <div className="space-y-3">
        <Skeleton className="h-[120px] w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>

      {/* Recent Dreams */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <DreamCardSkeleton key={i} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
