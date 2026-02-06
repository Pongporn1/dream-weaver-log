import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import {
  format,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { th } from "date-fns/locale";
import { BarChart3 } from "lucide-react";

interface Props {
  dreams: DreamLog[];
  mode: "week" | "month";
}

export function DreamFrequencyChart({ dreams, mode }: Props) {
  const chartData = useMemo(() => {
    if (dreams.length === 0) return [];

    const sortedDreams = [...dreams].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const firstDate = new Date(sortedDreams[0].date);
    const lastDate = new Date(sortedDreams[sortedDreams.length - 1].date);

    if (mode === "week") {
      const weeks = eachWeekOfInterval(
        { start: firstDate, end: lastDate },
        { weekStartsOn: 1 },
      );

      return weeks
        .map((weekStart) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const count = dreams.filter((dream) => {
            const dreamDate = new Date(dream.date);
            return dreamDate >= weekStart && dreamDate <= weekEnd;
          }).length;

          return {
            label: format(weekStart, "d MMM", { locale: th }),
            count,
            period: weekStart,
          };
        })
        .slice(-12); // Last 12 weeks
    } else {
      const months = eachMonthOfInterval({ start: firstDate, end: lastDate });

      return months
        .map((monthStart) => {
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0);

          const count = dreams.filter((dream) => {
            const dreamDate = new Date(dream.date);
            return dreamDate >= monthStart && dreamDate <= monthEnd;
          }).length;

          return {
            label: format(monthStart, "MMM yy", { locale: th }),
            count,
            period: monthStart,
          };
        })
        .slice(-12); // Last 12 months
    }
  }, [dreams, mode]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">
          ความถี่ความฝัน ({mode === "week" ? "รายสัปดาห์" : "รายเดือน"})
        </h2>
      </div>

      <div className="space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.count} ความฝัน</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {chartData.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            ยังไม่มีข้อมูล
          </p>
        )}
      </div>
    </div>
  );
}
