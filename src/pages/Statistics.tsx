import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  Shield,
  Zap,
  Brain,
  Star,
  Database,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { getDreamLogs, getWorlds, getEntities, getThreats } from "@/lib/api";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DreamFrequencyChart } from "@/components/analytics/DreamFrequencyChart";
import { WordCloud } from "@/components/analytics/WordCloud";
import { TopTags } from "@/components/analytics/TopTags";
import { ThreatTrends } from "@/components/analytics/ThreatTrends";
import { RecurringPatterns } from "@/components/analytics/RecurringPatterns";
import { EntityFrequency } from "@/components/analytics/EntityFrequency";
import { StreakCounter } from "@/components/analytics/StreakCounter";

export default function Statistics() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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

  // Recent trends (last 7 dreams vs previous 7)
  const recentDreams = dreams.slice(0, 7);
  const previousDreams = dreams.slice(7, 14);
  const recentAvgThreat =
    recentDreams.length > 0
      ? recentDreams.reduce((sum, d) => sum + d.threatLevel, 0) /
        recentDreams.length
      : 0;
  const previousAvgThreat =
    previousDreams.length > 0
      ? previousDreams.reduce((sum, d) => sum + d.threatLevel, 0) /
        previousDreams.length
      : 0;
  const threatTrend = recentAvgThreat - previousAvgThreat;

  // Most common environments
  const allEnvironments: Record<string, number> = {};
  dreams.forEach((d) => {
    d.environments.forEach((env) => {
      allEnvironments[env] = (allEnvironments[env] || 0) + 1;
    });
  });
  const topEnvironments = Object.entries(allEnvironments)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Safety override analysis
  const safetyStats = {
    none: dreams.filter((d) => d.safetyOverride === "none").length,
    helper: dreams.filter((d) => d.safetyOverride === "helper").length,
    separation: dreams.filter((d) => d.safetyOverride === "separation").length,
    wake: dreams.filter((d) => d.safetyOverride === "wake").length,
  };

  // Database usage estimation
  const estimatedSize = {
    dreams: totalDreams * 3, // ~3 KB per dream log (avg)
    worlds: worlds.length * 0.5, // ~0.5 KB per world
    entities: entities.length * 0.5, // ~0.5 KB per entity
    threats: threats.length * 0.3, // ~0.3 KB per threat
    relations: totalDreams * 0.5, // ~0.5 KB for relations
  };
  const totalUsedKB = Object.values(estimatedSize).reduce(
    (sum, val) => sum + val,
    0,
  );
  const totalUsedMB = totalUsedKB / 1024;
  const maxStorageMB = 500; // Free tier limit
  const usagePercent = (totalUsedMB / maxStorageMB) * 100;
  const remainingMB = maxStorageMB - totalUsedMB;
  const estimatedCapacity =
    Math.floor(remainingMB / (totalUsedMB / totalDreams || 3)) + totalDreams;

  // Insights
  const insights = [];

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

  const highThreatRecent = recentDreams.filter(
    (d) => d.threatLevel >= 4,
  ).length;
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

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1>Statistics & Insights</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {lastUpdate.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => loadData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Original Overview Content */}

          {/* Insights Cards */}
          {insights.length > 0 && (
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`card-minimal flex items-start gap-3 ${
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
                  <p className="text-sm flex-1">{insight.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Database Usage */}
          <div className="card-minimal space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Database Usage</h2>
              </div>
              <Badge variant="outline" className="text-xs">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Live
              </Badge>
            </div>

            {/* Storage Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-semibold">
                  {totalUsedMB.toFixed(2)} MB / {maxStorageMB} MB
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    usagePercent > 80
                      ? "bg-red-500"
                      : usagePercent > 60
                        ? "bg-orange-500"
                        : usagePercent > 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {usagePercent.toFixed(2)}% ใช้งานแล้ว • เหลือ{" "}
                {remainingMB.toFixed(2)} MB
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  Dream Logs
                </p>
                <p className="text-sm font-semibold">
                  {estimatedSize.dreams.toFixed(1)} KB
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Worlds
                </p>
                <p className="text-sm font-semibold">
                  {estimatedSize.worlds.toFixed(1)} KB
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Entities
                </p>
                <p className="text-sm font-semibold">
                  {estimatedSize.entities.toFixed(1)} KB
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Threats
                </p>
                <p className="text-sm font-semibold">
                  {estimatedSize.threats.toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Capacity Info */}
            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ความจุโดยประมาณ</span>
                <span className="font-semibold text-primary">
                  ~{estimatedCapacity.toLocaleString()} logs
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                เพิ่มอีกได้ประมาณ{" "}
                {(estimatedCapacity - totalDreams).toLocaleString()} logs
              </p>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-minimal">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Dreams</p>
              </div>
              <p className="text-2xl font-bold">{totalDreams}</p>
            </div>
            <div className="card-minimal">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Avg Threat</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{avgThreatLevel}</p>
                {threatTrend !== 0 && dreams.length > 7 && (
                  <Badge
                    variant={threatTrend > 0 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {threatTrend > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(threatTrend).toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="card-minimal">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Worlds</p>
              </div>
              <p className="text-2xl font-bold">{worlds.length}</p>
            </div>
            <div className="card-minimal">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Entities</p>
              </div>
              <p className="text-2xl font-bold">{entities.length}</p>
            </div>
          </div>

          {/* Threat Level Distribution */}
          <div className="card-minimal space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">
                Threat Level Distribution
              </h2>
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
                      <span className="text-muted-foreground">
                        #{index + 1}
                      </span>
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
                  <p className="text-sm text-muted-foreground">
                    ยังไม่มีข้อมูล
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Time System Usage */}
          <div className="card-minimal space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Time System Usage</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Inactive</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="h-full bg-slate-500 rounded-full transition-all"
                      style={{
                        width: `${totalDreams > 0 ? (timeSystemCounts.inactive / totalDreams) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">
                    {timeSystemCounts.inactive}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Activated</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${totalDreams > 0 ? (timeSystemCounts.activated / totalDreams) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">
                    {timeSystemCounts.activated}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Unknown</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary rounded-full h-2">
                    <div
                      className="h-full bg-muted-foreground rounded-full transition-all"
                      style={{
                        width: `${totalDreams > 0 ? (timeSystemCounts.unknown / totalDreams) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">
                    {timeSystemCounts.unknown}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Environments */}
          {topEnvironments.length > 0 && (
            <div className="card-minimal space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">Top Environments</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {topEnvironments.map(([env, count]) => (
                  <div
                    key={env}
                    className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-full"
                  >
                    <span className="text-sm">{env}</span>
                    <Badge variant="outline" className="text-xs ml-1">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Override Stats */}
          <div className="card-minimal space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Safety Override Usage</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">None</p>
                <p className="text-xl font-bold">{safetyStats.none}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Helper</p>
                <p className="text-xl font-bold">{safetyStats.helper}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Separation</p>
                <p className="text-xl font-bold">{safetyStats.separation}</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Wake</p>
                <p className="text-xl font-bold">{safetyStats.wake}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <DreamFrequencyChart dreams={dreams} mode="week" />
          <DreamFrequencyChart dreams={dreams} mode="month" />
          <ThreatTrends dreams={dreams} />
          <WordCloud dreams={dreams} />
          <TopTags dreams={dreams} />
          <StreakCounter dreams={dreams} />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <RecurringPatterns dreams={dreams} entities={entities} />
          <EntityFrequency dreams={dreams} entities={entities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
