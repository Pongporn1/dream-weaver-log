import { Skeleton } from "@/components/ui/skeleton";

export function BookCoverSkeleton() {
  return (
    <div className="aspect-[3/4] rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

export function LibrarySectionSkeleton() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-1 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded" />
      </div>
      <div className="p-4 pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <BookCoverSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LibraryPageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <LibrarySectionSkeleton key={i} />
      ))}
    </div>
  );
}
