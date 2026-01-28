import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { Badge } from "@/components/ui/badge";
import { Tags } from "lucide-react";

interface Props {
  dreams: DreamLog[];
}

export function TopTags({ dreams }: Props) {
  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();

    dreams.forEach((dream) => {
      const allTags = [
        ...dream.environments,
        ...dream.entities,
        dream.world,
        dream.timeSystem,
        dream.safetyOverride,
      ];

      allTags.forEach((tag) => {
        if (tag && tag !== "unknown" && tag !== "none") {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      });
    });

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [dreams]);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Tags className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">แท็กที่พบบ่อยที่สุด</h2>
      </div>

      {tagStats.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tagStats.map(({ tag, count }) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs px-3 py-1 gap-2"
            >
              <span>{tag}</span>
              <span className="text-primary font-semibold">{count}</span>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          ยังไม่มีข้อมูล
        </p>
      )}
    </div>
  );
}
