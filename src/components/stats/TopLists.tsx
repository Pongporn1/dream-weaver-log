import { MapPin, Users, AlertTriangle, Clock, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";

interface TopListsProps {
  dreams: DreamLog[];
  worlds: World[];
  entities: Entity[];
  threats: ThreatEntry[];
}

export function TopWorldsList({ worlds }: { worlds: World[] }) {
  const worldCounts = worlds
    .map((w) => ({ name: w.name, count: w.dreamIds.length, stability: w.stability }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Top 5 Worlds</h2>
      </div>
      <div className="space-y-2">
        {worldCounts.map((world, index) => (
          <div key={world.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">#{index + 1}</span>
              <span>{world.name}</span>
              <span className="text-xs text-muted-foreground">(stability {world.stability}/5)</span>
            </div>
            <span className="text-xs text-muted-foreground">{world.count} dreams</span>
          </div>
        ))}
        {worldCounts.length === 0 && (
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
        )}
      </div>
    </div>
  );
}

export function TopEntitiesList({ entities }: { entities: Entity[] }) {
  const entityCounts = entities
    .map((e) => ({ name: e.name, role: e.role, count: e.dreamIds.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Top 5 Entities</h2>
      </div>
      <div className="space-y-2">
        {entityCounts.map((entity, index) => (
          <div key={entity.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">#{index + 1}</span>
              <span>{entity.name}</span>
              <span className="text-xs text-muted-foreground">({entity.role})</span>
            </div>
            <span className="text-xs text-muted-foreground">{entity.count} dreams</span>
          </div>
        ))}
        {entityCounts.length === 0 && (
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
        )}
      </div>
    </div>
  );
}

export function ThreatAnalysis({ threats }: { threats: ThreatEntry[] }) {
  const highThreats = threats.filter((t) => t.level >= 4);
  const threatCounts = threats
    .map((t) => ({ name: t.name, level: t.level, count: t.dreamIds.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h2 className="text-sm font-semibold">Threat Analysis</h2>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>High Threats (Level 4-5)</span>
          <span className="font-semibold text-red-500">{highThreats.length}</span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Most Common Threats:</p>
          {threatCounts.map((threat, index) => (
            <div key={threat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#{index + 1}</span>
                <span>{threat.name}</span>
                <span className={`text-xs ${threat.level >= 4 ? "text-red-500" : "text-muted-foreground"}`}>
                  (level {threat.level})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{threat.count} times</span>
            </div>
          ))}
          {threatCounts.length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TimeSystemUsage({ dreams }: { dreams: DreamLog[] }) {
  const totalDreams = dreams.length;
  const timeSystemCounts = {
    inactive: dreams.filter((d) => d.timeSystem === "inactive").length,
    activated: dreams.filter((d) => d.timeSystem === "activated").length,
    unknown: dreams.filter((d) => d.timeSystem === "unknown").length,
  };

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Time System Usage</h2>
      </div>
      <div className="space-y-2">
        {[
          { label: "Inactive", value: timeSystemCounts.inactive, color: "bg-slate-500" },
          { label: "Activated", value: timeSystemCounts.activated, color: "bg-blue-500" },
          { label: "Unknown", value: timeSystemCounts.unknown, color: "bg-muted-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span>{label}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-secondary rounded-full h-2">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${totalDreams > 0 ? (value / totalDreams) * 100 : 0}%` }}
                />
              </div>
              <span className="text-muted-foreground w-12 text-right">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopEnvironments({ dreams }: { dreams: DreamLog[] }) {
  const allEnvironments: Record<string, number> = {};
  dreams.forEach((d) => {
    d.environments.forEach((env) => {
      allEnvironments[env] = (allEnvironments[env] || 0) + 1;
    });
  });
  const topEnvironments = Object.entries(allEnvironments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (topEnvironments.length === 0) return null;

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Top Environments</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {topEnvironments.map(([env, count]) => (
          <div key={env} className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-full">
            <span className="text-sm">{env}</span>
            <Badge variant="outline" className="text-xs ml-1">{count}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SafetyOverrideStats({ dreams }: { dreams: DreamLog[] }) {
  const safetyStats = {
    none: dreams.filter((d) => d.safetyOverride === "none").length,
    helper: dreams.filter((d) => d.safetyOverride === "helper").length,
    separation: dreams.filter((d) => d.safetyOverride === "separation").length,
    wake: dreams.filter((d) => d.safetyOverride === "wake").length,
  };

  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Safety Override Usage</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(safetyStats).map(([key, value]) => (
          <div key={key} className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1 capitalize">{key}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
