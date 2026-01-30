import { TrendingUp } from "lucide-react";
import { DreamLog } from "@/types/dream";

interface ThreatDistributionProps {
  dreams: DreamLog[];
}

export function ThreatDistribution({ dreams }: ThreatDistributionProps) {
  const totalDreams = dreams.length;
  const threatDistribution = [0, 1, 2, 3, 4, 5].map((level) => ({
    level,
    count: dreams.filter((d) => d.threatLevel === level).length,
  }));

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Threat Level Distribution</h2>
      </div>
      <div className="space-y-2">
        {threatDistribution.map(({ level, count }) => (
          <div key={level} className="flex items-center gap-2">
            <span className="text-xs w-16">Level {level}</span>
            <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  level >= 4 ? "bg-red-500" : level >= 3 ? "bg-orange-500" : "bg-primary"
                }`}
                style={{ width: `${totalDreams > 0 ? (count / totalDreams) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
