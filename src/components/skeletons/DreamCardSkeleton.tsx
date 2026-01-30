import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  compact?: boolean;
}

export function DreamCardSkeleton({ compact }: Props) {
  if (compact) {
    return (
      <div className="card-minimal flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    );
  }

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
