import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  AlertTriangle,
} from "lucide-react";
import { getDreamLogs, getWorlds, getEntities, getThreats } from "@/lib/api";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";

export default function Statistics() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreamsData, worldsData, entitiesData, threatsData] =
          await Promise.all([
            getDreamLogs(),
            getWorlds(),
            getEntities(),
            getThreats(),
          ]);
        setDreams(dreamsData);
        setWorlds(worldsData);
        setEntities(entitiesData);
        setThreats(threatsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate statistics
  const totalDreams = dreams.length;
  const avgThreatLevel =
    dreams.length > 0
      ? (
          dreams.reduce((sum, d) => sum + d.threatLevel, 0) / dreams.length
        ).toFixed(1)
      : "0";

  // Most common worlds
  const worldCounts = worlds
    .map((w) => ({
      name: w.name,
      count: w.dreamIds.length,
      stability: w.stability,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Most common entities
  const entityCounts = entities
    .map((e) => ({ name: e.name, role: e.role, count: e.dreamIds.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Threat analysis
  const highThreats = threats.filter((t) => t.level >= 4);
  const threatCounts = threats
    .map((t) => ({ name: t.name, level: t.level, count: t.dreamIds.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Threat level distribution
  const threatDistribution = [0, 1, 2, 3, 4, 5].map((level) => ({
    level,
    count: dreams.filter((d) => d.threatLevel === level).length,
  }));

  // Time system usage
  const timeSystemCounts = {
    inactive: dreams.filter((d) => d.timeSystem === "inactive").length,
    activated: dreams.filter((d) => d.timeSystem === "activated").length,
    unknown: dreams.filter((d) => d.timeSystem === "unknown").length,
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h1>Statistics & Insights</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground">Total Dreams</p>
          <p className="text-2xl font-bold">{totalDreams}</p>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground">Avg Threat</p>
          <p className="text-2xl font-bold">{avgThreatLevel}</p>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground">Worlds</p>
          <p className="text-2xl font-bold">{worlds.length}</p>
        </div>
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground">Entities</p>
          <p className="text-2xl font-bold">{entities.length}</p>
        </div>
      </div>

      {/* Threat Level Distribution */}
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
                    level >= 4
                      ? "bg-red-500"
                      : level >= 3
                        ? "bg-orange-500"
                        : "bg-primary"
                  }`}
                  style={{
                    width: `${totalDreams > 0 ? (count / totalDreams) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Common Worlds */}
      <div className="card-minimal space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Top 5 Worlds</h2>
        </div>
        <div className="space-y-2">
          {worldCounts.map((world, index) => (
            <div
              key={world.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#{index + 1}</span>
                <span>{world.name}</span>
                <span className="text-xs text-muted-foreground">
                  (stability {world.stability}/5)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {world.count} dreams
              </span>
            </div>
          ))}
          {worldCounts.length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>

      {/* Most Common Entities */}
      <div className="card-minimal space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Top 5 Entities</h2>
        </div>
        <div className="space-y-2">
          {entityCounts.map((entity, index) => (
            <div
              key={entity.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#{index + 1}</span>
                <span>{entity.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({entity.role})
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {entity.count} dreams
              </span>
            </div>
          ))}
          {entityCounts.length === 0 && (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>

      {/* Threat Analysis */}
      <div className="card-minimal space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold">Threat Analysis</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>High Threats (Level 4-5)</span>
            <span className="font-semibold text-red-500">
              {highThreats.length}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Most Common Threats:
            </p>
            {threatCounts.map((threat, index) => (
              <div
                key={threat.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">#{index + 1}</span>
                  <span>{threat.name}</span>
                  <span
                    className={`text-xs ${threat.level >= 4 ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    (level {threat.level})
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {threat.count} times
                </span>
              </div>
            ))}
            {threatCounts.length === 0 && (
              <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

      {/* Time System Usage */}
      <div className="card-minimal space-y-3">
        <h2 className="text-sm font-semibold">Time System Usage</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Inactive</span>
            <span className="text-muted-foreground">
              {timeSystemCounts.inactive} dreams
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Activated</span>
            <span className="text-muted-foreground">
              {timeSystemCounts.activated} dreams
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Unknown</span>
            <span className="text-muted-foreground">
              {timeSystemCounts.unknown} dreams
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
