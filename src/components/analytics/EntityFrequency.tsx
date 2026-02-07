import { useMemo } from "react";
import { DreamLog, Entity } from "@/types/dream";
import { Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  dreams: DreamLog[];
  entities: Entity[];
}

export function EntityFrequency({ dreams, entities }: Props) {
  const frequentEntities = useMemo(() => {
    const entityMap = new Map<
      string,
      { count: number; role: string; lastSeen: string }
    >();

    entities.forEach((entity) => {
      const count = entity.dreamIds.length;
      if (count >= 2) {
        // Find last dream with this entity
        const lastDream = dreams
          .filter((d) => entity.dreamIds.includes(d.id))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

        entityMap.set(entity.name, {
          count,
          role: entity.role,
          lastSeen: lastDream?.date || "",
        });
      }
    });

    return Array.from(entityMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [dreams, entities]);

  const notifications = useMemo(() => {
    return frequentEntities
      .filter((e) => e.count >= 3)
      .map((e) => `คุณฝันถึง "${e.name}" ครั้งที่ ${e.count} แล้ว!`);
  }, [frequentEntities]);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Entities ที่ปรากฏบ่อย</h2>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((msg, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-primary/35 bg-primary/10 p-2"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <p className="text-xs text-foreground/90">{msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Entity List */}
      {frequentEntities.length > 0 ? (
        <div className="space-y-2">
          {frequentEntities.map(({ name, count, role }) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background/45 p-2 transition-colors hover:bg-background/70"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-foreground/70">{role}</p>
              </div>
              <Badge
                variant="secondary"
                className="border border-border/70 bg-background/70 text-xs text-foreground"
              >
                {count} ครั้ง
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          ยังไม่มี entities ที่ปรากฏบ่อย
        </p>
      )}
    </div>
  );
}
