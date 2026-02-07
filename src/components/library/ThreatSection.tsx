import { useMemo } from "react";
import type { DreamLog, ThreatEntry } from "@/types/dream";
import { AlertTriangle, Clock3, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ThreatSectionProps {
  threats: ThreatEntry[];
  dreams: DreamLog[];
  compact?: boolean;
  showHeader?: boolean;
  maxItems?: number;
}

interface ThreatProfile {
  threat: ThreatEntry;
  appearances: number;
  lastSeen: string | null;
}

const getLevelClass = (level: ThreatEntry["level"]) => {
  if (level >= 5) return "border-red-500/45 bg-red-500/15 text-red-300";
  if (level >= 4) return "border-orange-500/45 bg-orange-500/15 text-orange-300";
  if (level >= 3) return "border-amber-500/45 bg-amber-500/15 text-amber-300";
  return "border-border/70 bg-background/70 text-foreground/80";
};

export function ThreatSection({
  threats,
  dreams,
  compact = false,
  showHeader = true,
  maxItems,
}: ThreatSectionProps) {
  const profiles = useMemo(() => {
    const dreamById = new Map(dreams.map((dream) => [dream.id, dream]));

    const result: ThreatProfile[] = threats.map((threat) => {
      const relatedDreams = threat.dreamIds
        .map((dreamId) => dreamById.get(dreamId))
        .filter((dream): dream is DreamLog => Boolean(dream));

      const lastSeen =
        relatedDreams.length > 0
          ? relatedDreams
              .map((dream) => dream.date)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

      return {
        threat,
        appearances: relatedDreams.length,
        lastSeen,
      };
    });

    const sorted = result.sort((a, b) => {
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      if (b.threat.level !== a.threat.level) return b.threat.level - a.threat.level;
      return a.threat.name.localeCompare(b.threat.name, "th");
    });

    return typeof maxItems === "number" ? sorted.slice(0, maxItems) : sorted;
  }, [dreams, maxItems, threats]);

  if (profiles.length === 0) {
    return (
      <div className="card-minimal py-10 text-center text-muted-foreground">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 opacity-50" />
        <p>ยังไม่มี threat ในระบบ</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {showHeader && (
        <div className="flex items-center gap-2 px-1">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Threat Archive</h2>
        </div>
      )}

      <div className={cn(compact ? "space-y-2" : "grid gap-3 sm:grid-cols-2")}>
        {profiles.map((profile) => (
          <article
            key={profile.threat.id}
            className={cn(
              "card-minimal border border-border/70 bg-card/90 backdrop-blur-sm",
              compact ? "space-y-2 p-3" : "space-y-3",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className={cn("truncate font-semibold", compact ? "text-sm" : "text-base")}>
                  {profile.threat.name}
                </h3>
                <Badge
                  variant="outline"
                  className={`mt-2 border ${getLevelClass(profile.threat.level)}`}
                >
                  <Activity className="mr-1 h-3 w-3" />
                  Level {profile.threat.level}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className="border-border/70 bg-background/70 text-foreground/85"
              >
                พบในบันทึก {profile.appearances}
              </Badge>
              <Badge
                variant="outline"
                className={`border ${getLevelClass(profile.threat.level)}`}
              >
                ระดับ {profile.threat.level}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-foreground/75">
              <Clock3 className="h-3.5 w-3.5 text-primary" />
              {profile.lastSeen
                ? `ล่าสุด: ${format(new Date(profile.lastSeen), "d MMM yyyy", {
                    locale: th,
                  })}`
                : "ยังไม่ถูกใช้ในบันทึกฝัน"}
            </div>

            {profile.threat.response ? (
              <p
                className={cn(
                  "border-t border-border/70 pt-2 text-foreground/80",
                  compact ? "line-clamp-2 text-xs" : "text-sm",
                )}
              >
                ความสามารถ/วิธีรับมือ: {profile.threat.response}
              </p>
            ) : (
              <p
                className={cn(
                  "border-t border-border/70 pt-2 text-foreground/60",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                ไม่มีคำอธิบาย threat
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
