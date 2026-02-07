import { useMemo } from "react";
import { DreamLog } from "@/types/dream";
import { format, subDays } from "date-fns";
import { th } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  dreams: DreamLog[];
}

export function ThreatTrends({ dreams }: Props) {
  const trendData = useMemo(() => {
    const sortedDreams = [...dreams].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Last 14 days
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dreamsOnDate = sortedDreams.filter(
        (d) =>
          format(new Date(d.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
      );

      const avgThreat =
        dreamsOnDate.length > 0
          ? dreamsOnDate.reduce((sum, d) => sum + d.threatLevel, 0) /
            dreamsOnDate.length
          : 0;

      return {
        date,
        label: format(date, "d MMM", { locale: th }),
        avgThreat,
        count: dreamsOnDate.length,
      };
    }).reverse();

    // Calculate trend
    const recentAvg = last14Days
      .slice(-7)
      .filter((d) => d.count > 0)
      .reduce((sum, d, _, arr) => sum + d.avgThreat / arr.length, 0);

    const previousAvg = last14Days
      .slice(0, 7)
      .filter((d) => d.count > 0)
      .reduce((sum, d, _, arr) => sum + d.avgThreat / arr.length, 0);

    const trend = recentAvg - previousAvg;

    return { data: last14Days, trend, recentAvg, previousAvg };
  }, [dreams]);

  const maxThreat = Math.max(...trendData.data.map((d) => d.avgThreat), 5);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Threat Level Trends</h2>
        </div>
        {trendData.trend !== 0 && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trendData.trend > 0
                ? "text-red-500"
                : trendData.trend < 0
                  ? "text-green-500"
                  : "text-muted-foreground"
            }`}
          >
            {trendData.trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : trendData.trend < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(trendData.trend).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-background/65 p-3">
        <div>
          <p className="mb-1 text-xs text-foreground/70">7 วันล่าสุด</p>
          <p className="text-lg font-bold text-foreground">
            {trendData.recentAvg.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs text-foreground/70">7 วันก่อนหน้า</p>
          <p className="text-lg font-bold text-foreground">
            {trendData.previousAvg.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {trendData.data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground/70">{item.label}</span>
              <span
                className={`font-semibold ${
                  item.avgThreat >= 4
                    ? "text-red-500"
                    : item.avgThreat >= 3
                      ? "text-orange-500"
                      : "text-foreground"
                }`}
              >
                {item.count > 0 ? item.avgThreat.toFixed(1) : "-"}
              </span>
            </div>
            {item.count > 0 && (
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.avgThreat >= 4
                      ? "bg-red-500"
                      : item.avgThreat >= 3
                        ? "bg-orange-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${(item.avgThreat / maxThreat) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
