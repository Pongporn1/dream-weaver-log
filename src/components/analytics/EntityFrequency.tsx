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
              className="flex items-start gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/50 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300">{msg}</p>
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
              className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
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
