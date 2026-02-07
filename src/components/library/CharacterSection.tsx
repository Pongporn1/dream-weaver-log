import { useMemo } from "react";
import type { DreamLog, Entity } from "@/types/dream";
import {
  Users,
  Eye,
  Shield,
  Navigation,
  AlertTriangle,
  Clock3,
  Globe2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CharacterSectionProps {
  entities: Entity[];
  dreams: DreamLog[];
  compact?: boolean;
  showHeader?: boolean;
  maxItems?: number;
}

interface CharacterProfile {
  entity: Entity;
  appearances: number;
  worldCount: number;
  lastSeen: string | null;
}

const getRoleIcon = (role: Entity["role"]) => {
  switch (role) {
    case "observer":
      return Eye;
    case "protector":
      return Shield;
    case "guide":
      return Navigation;
    case "intruder":
      return AlertTriangle;
    default:
      return Users;
  }
};

const getRoleClass = (role: Entity["role"]) => {
  switch (role) {
    case "observer":
      return "border-blue-400/40 bg-blue-500/15 text-blue-300";
    case "protector":
      return "border-green-400/40 bg-green-500/15 text-green-300";
    case "guide":
      return "border-violet-400/40 bg-violet-500/15 text-violet-300";
    case "intruder":
      return "border-red-400/40 bg-red-500/15 text-red-300";
    default:
      return "border-border/70 bg-background/70 text-foreground/80";
  }
};

export function CharacterSection({
  entities,
  dreams,
  compact = false,
  showHeader = true,
  maxItems,
}: CharacterSectionProps) {
  const profiles = useMemo(() => {
    const dreamById = new Map(dreams.map((dream) => [dream.id, dream]));

    const result: CharacterProfile[] = entities.map((entity) => {
      const relatedDreams = entity.dreamIds
        .map((dreamId) => dreamById.get(dreamId))
        .filter((dream): dream is DreamLog => Boolean(dream));

      const worldCount = new Set(relatedDreams.map((dream) => dream.world)).size;

      const lastSeen =
        relatedDreams.length > 0
          ? relatedDreams
              .map((dream) => dream.date)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

      return {
        entity,
        appearances: relatedDreams.length,
        worldCount,
        lastSeen,
      };
    });

    const sorted = result.sort((a, b) => {
      if (b.appearances !== a.appearances) {
        return b.appearances - a.appearances;
      }
      return a.entity.name.localeCompare(b.entity.name, "th");
    });

    return typeof maxItems === "number" ? sorted.slice(0, maxItems) : sorted;
  }, [entities, dreams, maxItems]);

  if (profiles.length === 0) {
    return (
      <div className="card-minimal py-10 text-center text-muted-foreground">
        <Users className="mx-auto mb-3 h-10 w-10 opacity-50" />
        <p>ยังไม่มีตัวละครในระบบ</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-2")}>
      {showHeader && (
        <div className="flex items-center gap-2 px-1">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Character Archive</h2>
        </div>
      )}

      <div className={cn(compact ? "space-y-2" : "grid gap-3 sm:grid-cols-2")}>
        {profiles.map((profile) => {
          const RoleIcon = getRoleIcon(profile.entity.role);

          return (
            <article
              key={profile.entity.id}
              className={cn(
                "card-minimal border border-border/70 bg-card/90 backdrop-blur-sm",
                compact ? "space-y-2 p-3" : "space-y-3",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className={cn("truncate font-semibold", compact ? "text-sm" : "text-base")}>
                    {profile.entity.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`mt-2 border ${getRoleClass(profile.entity.role)}`}
                  >
                    <RoleIcon className="mr-1 h-3 w-3" />
                    {profile.entity.role}
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
                  className="border-border/70 bg-background/70 text-foreground/85"
                >
                  เชื่อม {profile.worldCount} โลก
                </Badge>
              </div>

              <div className="space-y-1 text-xs text-foreground/75">
                <div className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {profile.lastSeen
                    ? `ล่าสุด: ${format(new Date(profile.lastSeen), "d MMM yyyy", {
                        locale: th,
                      })}`
                    : "ยังไม่ถูกใช้ในบันทึกฝัน"}
                </div>
                {!compact && (
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-primary" />
                    {profile.worldCount > 0
                      ? `เชื่อมกับ ${profile.worldCount} โลก`
                      : "ยังไม่มีโลกที่เชื่อม"}
                  </div>
                )}
              </div>

              {profile.entity.description ? (
                <p
                  className={cn(
                    "border-t border-border/70 pt-2 text-foreground/80",
                    compact ? "line-clamp-2 text-xs" : "text-sm",
                  )}
                >
                  {profile.entity.description}
                </p>
              ) : (
                <p
                  className={cn(
                    "border-t border-border/70 pt-2 text-foreground/60",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  ไม่มีคำอธิบาย
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
