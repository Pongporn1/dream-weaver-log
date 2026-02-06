import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { th } from "date-fns/locale";
import { Clock, MapPin, AlertTriangle, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Props {
  dreams: DreamLog[];
}

export function TimelineView({ dreams }: Props) {
  const sortedDreams = useMemo(() => {
    return [...dreams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [dreams]);

  const getThreatColor = (level: number) => {
    if (level >= 4) return "text-red-500 bg-red-100 dark:bg-red-950";
    if (level >= 3) return "text-orange-500 bg-orange-100 dark:bg-orange-950";
    return "text-primary bg-primary/10";
  };

  if (dreams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ยังไม่มีความฝันในไทม์ไลน์</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        {sortedDreams.map((dream) => (
          <div key={dream.id} className="relative pl-16 pb-8 last:pb-0">
            {/* Timeline Dot */}
            <div
              className={cn(
                "absolute left-6 w-5 h-5 rounded-full border-4 border-background",
                getThreatColor(dream.threatLevel),
              )}
            />

            {/* Content Card */}
            <Link to={`/logs/${dream.id}`}>
              <div className="card-minimal hover:shadow-md transition-shadow cursor-pointer">
                {/* Date & Time */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {format(new Date(dream.date), "d MMMM yyyy", {
                        locale: th,
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dream.wakeTime}
                  </span>
                </div>

                {/* World */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-lg font-semibold">{dream.world}</span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {/* Threat Level */}
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Threat Level:
                    </span>
                    <Badge
                      variant="outline"
                      className={getThreatColor(dream.threatLevel)}
                    >
                      {dream.threatLevel}
                    </Badge>
                  </div>

                  {/* Entities */}
                  {dream.entities.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="w-3 h-3 text-muted-foreground mt-0.5" />
                      <div className="flex-1 flex flex-wrap gap-1">
                        {dream.entities.map((entity) => (
                          <Badge
                            key={entity}
                            variant="secondary"
                            className="text-xs"
                          >
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Environments */}
                  {dream.environments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dream.environments.map((env) => (
                        <Badge key={env} variant="outline" className="text-xs">
                          {env}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {dream.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {dream.notes}
                    </p>
                  )}

                  {/* Safety Override */}
                  {dream.safetyOverride !== "none" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-orange-600 dark:text-orange-400">
                        Safety Override: {dream.safetyOverride}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
