import { AlertTriangle, Shield, Clock, MapPin } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { DreamLog } from "@/types/dream";

interface Insight {
  type: "danger" | "warning" | "success" | "info";
  text: string;
  icon: LucideIcon;
}

interface InsightsCardsProps {
  dreams: DreamLog[];
  worldCounts: { name: string; count: number }[];
  timeSystemCounts: { inactive: number; activated: number; unknown: number };
}

export function InsightsCards({ dreams, worldCounts, timeSystemCounts }: InsightsCardsProps) {
  const totalDreams = dreams.length;
  const recentDreams = dreams.slice(0, 7);
  const previousDreams = dreams.slice(7, 14);
  
  const recentAvgThreat = recentDreams.length > 0
    ? recentDreams.reduce((sum, d) => sum + d.threatLevel, 0) / recentDreams.length
    : 0;
  const previousAvgThreat = previousDreams.length > 0
    ? previousDreams.reduce((sum, d) => sum + d.threatLevel, 0) / previousDreams.length
    : 0;
  const threatTrend = recentAvgThreat - previousAvgThreat;

  const insights: Insight[] = [];

  if (threatTrend > 0.5) {
    insights.push({
      type: "warning",
      text: `ระดับภัยคุกคามเพิ่มขึ้น ${threatTrend.toFixed(1)} จากช่วงก่อน`,
      icon: AlertTriangle,
    });
  } else if (threatTrend < -0.5) {
    insights.push({
      type: "success",
      text: `ระดับภัยคุกคามลดลง ${Math.abs(threatTrend).toFixed(1)} จากช่วงก่อน`,
      icon: Shield,
    });
  }

  if (timeSystemCounts.activated > timeSystemCounts.inactive) {
    insights.push({
      type: "info",
      text: "Time System ถูกเปิดใช้งานบ่อยกว่าปกติ",
      icon: Clock,
    });
  }

  const highThreatRecent = recentDreams.filter((d) => d.threatLevel >= 4).length;
  if (highThreatRecent >= 3) {
    insights.push({
      type: "danger",
      text: `มีภัยคุกคามระดับสูง ${highThreatRecent} ครั้งในช่วงล่าสุด`,
      icon: AlertTriangle,
    });
  }

  const mostCommonWorld = worldCounts[0];
  if (mostCommonWorld && mostCommonWorld.count > totalDreams * 0.3) {
    insights.push({
      type: "info",
      text: `โลก "${mostCommonWorld.name}" ปรากฏบ่อยที่สุด (${mostCommonWorld.count} ครั้ง)`,
      icon: MapPin,
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className={`card-minimal flex min-w-0 items-start gap-3 p-3 sm:p-4 ${
            insight.type === "danger"
              ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
              : insight.type === "warning"
                ? "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"
                : insight.type === "success"
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
          }`}
        >
          <insight.icon
            className={`w-4 h-4 mt-0.5 ${
              insight.type === "danger"
                ? "text-red-500"
                : insight.type === "warning"
                  ? "text-orange-500"
                  : insight.type === "success"
                    ? "text-green-500"
                    : "text-blue-500"
            }`}
          />
          <p className="text-sm flex-1 break-words">{insight.text}</p>
        </div>
      ))}
    </div>
  );
}
