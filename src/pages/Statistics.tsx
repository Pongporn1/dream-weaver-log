import { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { getDreamLogs, getWorlds, getEntities, getThreats } from "@/lib/api";
import { DreamLog, World, Entity, ThreatEntry } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DreamFrequencyChart } from "@/components/analytics/DreamFrequencyChart";
import { WordCloud } from "@/components/analytics/WordCloud";
import { TopTags } from "@/components/analytics/TopTags";
import { ThreatTrends } from "@/components/analytics/ThreatTrends";
import { RecurringPatterns } from "@/components/analytics/RecurringPatterns";
import { EntityFrequency } from "@/components/analytics/EntityFrequency";
import { StreakCounter } from "@/components/analytics/StreakCounter";
import { StatsOverviewSkeleton } from "@/components/skeletons/StatsSkeleton";
import { DatabaseUsage } from "@/components/stats/DatabaseUsage";
import { StatsOverviewCards } from "@/components/stats/StatsOverviewCards";
import { InsightsCards } from "@/components/stats/InsightsCards";
import { ThreatDistribution } from "@/components/stats/ThreatDistribution";
import { AnimatedStatsSection } from "@/components/stats/AnimatedStatsSection";
import {
  TopWorldsList,
  TopEntitiesList,
  ThreatAnalysis,
  TimeSystemUsage,
  TopEnvironments,
  SafetyOverrideStats,
} from "@/components/stats/TopLists";

export default function Statistics() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [threats, setThreats] = useState<ThreatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dreamsData, worldsData, entitiesData, threatsData] = await Promise.all([
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate statistics
  const totalDreams = dreams.length;
  const avgThreatLevel = dreams.length > 0
    ? (dreams.reduce((sum, d) => sum + d.threatLevel, 0) / dreams.length).toFixed(1)
    : "0";

  // Trend calculation
  const recentDreams = dreams.slice(0, 7);
  const previousDreams = dreams.slice(7, 14);
  const recentAvgThreat = recentDreams.length > 0
    ? recentDreams.reduce((sum, d) => sum + d.threatLevel, 0) / recentDreams.length
    : 0;
  const previousAvgThreat = previousDreams.length > 0
    ? previousDreams.reduce((sum, d) => sum + d.threatLevel, 0) / previousDreams.length
    : 0;
  const threatTrend = recentAvgThreat - previousAvgThreat;

  // World counts for insights
  const worldCounts = worlds
    .map((w) => ({ name: w.name, count: w.dreamIds.length }))
    .sort((a, b) => b.count - a.count);

  // Time system counts for insights
  const timeSystemCounts = {
    inactive: dreams.filter((d) => d.timeSystem === "inactive").length,
    activated: dreams.filter((d) => d.timeSystem === "activated").length,
    unknown: dreams.filter((d) => d.timeSystem === "unknown").length,
  };

  if (loading) {
    return (
      <div className="py-4">
        <StatsOverviewSkeleton />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <AnimatedStatsSection delay={0} duration={400}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1>Statistics & Insights</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {lastUpdate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </AnimatedStatsSection>

      {/* Tabs */}
      <AnimatedStatsSection delay={80} duration={400}>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnimatedStatsSection delay={160} duration={400}>
              <InsightsCards
                dreams={dreams}
                worldCounts={worldCounts}
                timeSystemCounts={timeSystemCounts}
              />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={240} duration={400}>
              <DatabaseUsage
                totalDreams={totalDreams}
                worldsCount={worlds.length}
                entitiesCount={entities.length}
                threatsCount={threats.length}
              />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={320} duration={400}>
              <StatsOverviewCards
                totalDreams={totalDreams}
                avgThreatLevel={avgThreatLevel}
                threatTrend={threatTrend}
                worldsCount={worlds.length}
                entitiesCount={entities.length}
              />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={400} duration={400}>
              <ThreatDistribution dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={480} duration={400}>
              <TopWorldsList worlds={worlds} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={560} duration={400}>
              <TopEntitiesList entities={entities} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={640} duration={400}>
              <ThreatAnalysis threats={threats} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={720} duration={400}>
              <TimeSystemUsage dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={800} duration={400}>
              <TopEnvironments dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={880} duration={400}>
              <SafetyOverrideStats dreams={dreams} />
            </AnimatedStatsSection>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnimatedStatsSection delay={100} duration={400}>
              <DreamFrequencyChart dreams={dreams} mode="week" />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={180} duration={400}>
              <DreamFrequencyChart dreams={dreams} mode="month" />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={260} duration={400}>
              <ThreatTrends dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={340} duration={400}>
              <WordCloud dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={420} duration={400}>
              <TopTags dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={500} duration={400}>
              <StreakCounter dreams={dreams} />
            </AnimatedStatsSection>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <AnimatedStatsSection delay={100} duration={400}>
              <RecurringPatterns dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={180} duration={400}>
              <EntityFrequency dreams={dreams} entities={entities} />
            </AnimatedStatsSection>
          </TabsContent>
        </Tabs>
      </AnimatedStatsSection>
    </div>
  );
}
