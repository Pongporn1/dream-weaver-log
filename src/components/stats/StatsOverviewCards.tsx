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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card-minimal">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Total Dreams</p>
        </div>
        <p className="text-2xl font-bold">{totalDreams}</p>
      </div>
      <div className="card-minimal">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Avg Threat</p>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{avgThreatLevel}</p>
          {threatTrend !== 0 && totalDreams > 7 && (
            <Badge variant={threatTrend > 0 ? "destructive" : "secondary"} className="text-xs">
              {threatTrend > 0 ? "↑" : "↓"} {Math.abs(threatTrend).toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
      <div className="card-minimal">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Worlds</p>
        </div>
        <p className="text-2xl font-bold">{worldsCount}</p>
      </div>
      <div className="card-minimal">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Entities</p>
        </div>
        <p className="text-2xl font-bold">{entitiesCount}</p>
      </div>
    </div>
  );
}
