import { useMemo } from "react";
import { DreamLog, Entity } from "@/types/dream";
import { Users, Shield, Eye, Navigation, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Props {
  dreams: DreamLog[];
  entities: Entity[];
}

interface CharacterProfile {
  entity: Entity;
  appearances: number;
  worlds: Set<string>;
  avgThreat: number;
  firstSeen: string;
  lastSeen: string;
  coAppearances: Map<string, number>;
}

export function CharacterEncyclopedia({ dreams, entities }: Props) {
  const characters = useMemo(() => {
    const profiles: CharacterProfile[] = [];

    entities.forEach((entity) => {
      const entityDreams = dreams.filter((d) => entity.dreamIds.includes(d.id));
      if (entityDreams.length === 0) return;

      // Calculate stats
      const worlds = new Set(entityDreams.map((d) => d.world));
      const avgThreat =
        entityDreams.reduce((sum, d) => sum + d.threatLevel, 0) /
        entityDreams.length;

      const sortedDreams = [...entityDreams].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Find co-appearances
      const coAppearances = new Map<string, number>();
      entityDreams.forEach((dream) => {
        dream.entities
          .filter((e) => e !== entity.name)
          .forEach((otherEntity) => {
            coAppearances.set(
              otherEntity,
              (coAppearances.get(otherEntity) || 0) + 1,
            );
          });
      });

      profiles.push({
        entity,
        appearances: entityDreams.length,
        worlds,
        avgThreat,
        firstSeen: sortedDreams[0].date,
        lastSeen: sortedDreams[sortedDreams.length - 1].date,
        coAppearances,
      });
    });

    return profiles.sort((a, b) => b.appearances - a.appearances);
  }, [dreams, entities]);

  const getRoleIcon = (role: string) => {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "observer":
        return "text-blue-500 bg-blue-100 dark:bg-blue-950";
      case "protector":
        return "text-green-500 bg-green-100 dark:bg-green-950";
      case "guide":
        return "text-purple-500 bg-purple-100 dark:bg-purple-950";
      case "intruder":
        return "text-red-500 bg-red-100 dark:bg-red-950";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  if (characters.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>ยังไม่มีตัวละครในสารานุกรม</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          สารานุกรมตัวละคร ({characters.length} ตัวละคร)
        </h2>
      </div>

      {/* Character Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {characters.map((char) => {
          const RoleIcon = getRoleIcon(char.entity.role);

          return (
            <div key={char.entity.id} className="card-minimal space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    {char.entity.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(char.entity.role)}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {char.entity.role}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {char.appearances}
                  </p>
                  <p className="text-xs text-muted-foreground">ครั้ง</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-secondary/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Worlds</p>
                  <p className="text-sm font-semibold">{char.worlds.size}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Avg Threat
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      char.avgThreat >= 4
                        ? "text-red-500"
                        : char.avgThreat >= 3
                          ? "text-orange-500"
                          : "text-foreground"
                    }`}
                  >
                    {char.avgThreat.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Co-appear
                  </p>
                  <p className="text-sm font-semibold">
                    {char.coAppearances.size}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เห็นครั้งแรก:</span>
                  <span className="font-medium">
                    {format(new Date(char.firstSeen), "d MMM yyyy", {
                      locale: th,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เห็นล่าสุด:</span>
                  <span className="font-medium">
                    {format(new Date(char.lastSeen), "d MMM yyyy", {
                      locale: th,
                    })}
                  </span>
                </div>
              </div>

              {/* Worlds */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">ปรากฏในโลก:</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(char.worlds).map((world) => (
                    <Badge key={world} variant="outline" className="text-xs">
                      {world}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Co-appearances */}
              {char.coAppearances.size > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">ปรากฏร่วมกับ:</p>
                  <div className="space-y-1">
                    {Array.from(char.coAppearances.entries())
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">{name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}x
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {char.entity.description && (
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  {char.entity.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
