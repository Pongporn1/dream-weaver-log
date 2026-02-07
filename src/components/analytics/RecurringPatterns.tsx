import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  dreams: DreamLog[];
}

export function RecurringPatterns({ dreams }: Props) {
  const patterns = useMemo(() => {
    // Find recurring themes in environments
    const envCounts = new Map<string, number>();
    dreams.forEach((dream) => {
      dream.environments.forEach((env) => {
        envCounts.set(env, (envCounts.get(env) || 0) + 1);
      });
    });

    // Find recurring entity combinations
    const entityCombos = new Map<string, number>();
    dreams.forEach((dream) => {
      if (dream.entities.length >= 2) {
        const combo = dream.entities.sort().join(" + ");
        entityCombos.set(combo, (entityCombos.get(combo) || 0) + 1);
      }
    });

    // Find recurring world patterns
    const worldSequences = new Map<string, number>();
    for (let i = 0; i < dreams.length - 1; i++) {
      const seq = `${dreams[i].world} → ${dreams[i + 1].world}`;
      worldSequences.set(seq, (worldSequences.get(seq) || 0) + 1);
    }

    return {
      recurringEnvs: Array.from(envCounts.entries())
        .filter(([, count]) => count >= 3)
        .map(([env, count]) => ({ env, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),

      recurringCombos: Array.from(entityCombos.entries())
        .filter(([, count]) => count >= 2)
        .map(([combo, count]) => ({ combo, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),

      worldPatterns: Array.from(worldSequences.entries())
        .filter(([, count]) => count >= 2)
        .map(([seq, count]) => ({ seq, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    };
  }, [dreams]);

  const hasPatterns =
    patterns.recurringEnvs.length > 0 ||
    patterns.recurringCombos.length > 0 ||
    patterns.worldPatterns.length > 0;

  return (
    <div className="card-minimal space-y-4">
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Recurring Patterns</h2>
      </div>

      {!hasPatterns ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          ยังไม่พบรูปแบบที่ซ้ำกัน
        </p>
      ) : (
        <div className="space-y-4">
          {/* Recurring Environments */}
          {patterns.recurringEnvs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground/70">
                สภาพแวดล้อมที่พบบ่อย
              </h3>
              <div className="space-y-1">
                {patterns.recurringEnvs.map(({ env, count }) => (
                  <div
                    key={env}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/45 px-2 py-1.5 text-sm"
                  >
                    <span className="text-foreground">{env}</span>
                    <Badge
                      variant="secondary"
                      className="border border-border/70 bg-background/70 text-xs text-foreground"
                    >
                      {count} ครั้ง
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Entity Combinations */}
          {patterns.recurringCombos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground/70">
                ตัวละครที่ปรากฏพร้อมกัน
              </h3>
              <div className="space-y-1">
                {patterns.recurringCombos.map(({ combo, count }) => (
                  <div
                    key={combo}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/45 px-2 py-1.5 text-sm"
                  >
                    <span className="max-w-[80%] truncate text-xs text-foreground/90">
                      {combo}
                    </span>
                    <Badge
                      variant="secondary"
                      className="border border-border/70 bg-background/70 text-xs text-foreground"
                    >
                      {count} ครั้ง
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* World Patterns */}
          {patterns.worldPatterns.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground/70">
                ลำดับโลกที่เกิดซ้ำ
              </h3>
              <div className="space-y-1">
                {patterns.worldPatterns.map(({ seq, count }) => (
                  <div
                    key={seq}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/45 px-2 py-1.5 text-sm"
                  >
                    <span className="max-w-[80%] truncate text-xs text-foreground/90">
                      {seq}
                    </span>
                    <Badge
                      variant="secondary"
                      className="border border-border/70 bg-background/70 text-xs text-foreground"
                    >
                      {count} ครั้ง
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
