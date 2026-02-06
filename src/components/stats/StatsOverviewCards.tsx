import { Calendar, TrendingUp, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsOverviewCardsProps {
  totalDreams: number;
  avgThreatLevel: string;
  threatTrend: number;
  worldsCount: number;
  entitiesCount: number;
}

export function StatsOverviewCards({
  totalDreams,
  avgThreatLevel,
  threatTrend,
  worldsCount,
  entitiesCount,
}: StatsOverviewCardsProps) {
  return (
    <div className="grid w-full max-w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <div className="card-minimal min-w-0 p-3 sm:p-4">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <p className="truncate text-xs text-muted-foreground">Total Dreams</p>
        </div>
        <p className="break-words text-xl sm:text-2xl font-bold">{totalDreams}</p>
      </div>
      <div className="card-minimal min-w-0 p-3 sm:p-4">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <p className="truncate text-xs text-muted-foreground">Avg Threat</p>
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="break-words text-xl sm:text-2xl font-bold">{avgThreatLevel}</p>
          {threatTrend !== 0 && totalDreams > 7 && (
            <Badge variant={threatTrend > 0 ? "destructive" : "secondary"} className="text-xs">
              {threatTrend > 0 ? "↑" : "↓"} {Math.abs(threatTrend).toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
      <div className="card-minimal min-w-0 p-3 sm:p-4">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <p className="truncate text-xs text-muted-foreground">Worlds</p>
        </div>
        <p className="break-words text-xl sm:text-2xl font-bold">{worldsCount}</p>
      </div>
      <div className="card-minimal min-w-0 p-3 sm:p-4">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="truncate text-xs text-muted-foreground">Entities</p>
        </div>
        <p className="break-words text-xl sm:text-2xl font-bold">{entitiesCount}</p>
      </div>
    </div>
  );
}
