import { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw, Download } from "lucide-react";
import {
  getDreamLogs,
  getWorlds,
  getEntities,
  getThreats,
  addEntity,
  addThreat,
} from "@/lib/api";
import { downloadHTML } from "@/lib/exportHTML";
import {
  DreamLog,
  World,
  Entity,
  ThreatEntry,
  ENTITY_ROLES,
} from "@/types/dream";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
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
import { CalendarView } from "@/components/stats/CalendarView";
import { DreamMap } from "@/components/stats/DreamMap";
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
  const [addingEntity, setAddingEntity] = useState(false);
  const [addingThreat, setAddingThreat] = useState(false);
  const [entityDraft, setEntityDraft] = useState({
    name: "",
    role: "observer" as Entity["role"],
    description: "",
  });
  const [threatDraft, setThreatDraft] = useState({
    name: "",
    level: "3",
    response: "",
  });

  const loadData = useCallback(async (isRefresh = false) => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEntity = async () => {
    const name = entityDraft.name.trim();
    if (!name) {
      toast({
        title: "กรุณาใส่ชื่อตัวละคร",
        variant: "destructive",
      });
      return;
    }

    const exists = entities.some(
      (entity) => entity.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      toast({
        title: "ชื่อตัวละครนี้มีอยู่แล้ว",
        variant: "destructive",
      });
      return;
    }

    setAddingEntity(true);
    try {
      const created = await addEntity({
        name,
        role: entityDraft.role,
        description: entityDraft.description.trim() || undefined,
      });

      if (!created) {
        toast({
          title: "เพิ่มตัวละครไม่สำเร็จ",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "เพิ่มตัวละครแล้ว" });
      setEntityDraft({
        name: "",
        role: "observer",
        description: "",
      });
      await loadData(true);
    } finally {
      setAddingEntity(false);
    }
  };

  const handleAddThreat = async () => {
    const name = threatDraft.name.trim();
    if (!name) {
      toast({
        title: "กรุณาใส่ชื่อ threat",
        variant: "destructive",
      });
      return;
    }

    const exists = threats.some(
      (threat) => threat.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      toast({
        title: "ชื่อ threat นี้มีอยู่แล้ว",
        variant: "destructive",
      });
      return;
    }

    setAddingThreat(true);
    try {
      const created = await addThreat({
        name,
        level: Number(threatDraft.level) as ThreatEntry["level"],
        response: threatDraft.response.trim() || undefined,
      });

      if (!created) {
        toast({
          title: "เพิ่ม threat ไม่สำเร็จ",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "เพิ่ม threat แล้ว" });
      setThreatDraft({
        name: "",
        level: "3",
        response: "",
      });
      await loadData(true);
    } finally {
      setAddingThreat(false);
    }
  };

  // Calculate statistics
  const totalDreams = dreams.length;
  const avgThreatLevel =
    dreams.length > 0
      ? (
          dreams.reduce((sum, d) => sum + d.threatLevel, 0) / dreams.length
        ).toFixed(1)
      : "0";

  // Trend calculation
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
    <div className="container-app space-y-4 sm:space-y-6 overflow-x-hidden pb-20 sm:pb-24 min-h-screen">
      {/* Header */}
      <AnimatedStatsSection delay={0} duration={400}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-semibold truncate">
              Statistics & Insights
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {lastUpdate.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => {
                downloadHTML(
                  dreams,
                  `dream-logs-${new Date().toISOString().split("T")[0]}`,
                );
                toast({ title: "กำลังดาวน์โหลด HTML..." });
              }}
              title="Export เป็น HTML"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </AnimatedStatsSection>

      {/* Tabs */}
      <AnimatedStatsSection delay={80} duration={400}>
        <Tabs
          defaultValue="overview"
          className="space-y-3 sm:space-y-4 max-w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-5 gap-1 rounded-lg border bg-muted/60 p-1">
            <TabsTrigger
              value="overview"
              className="px-1.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="px-1.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="patterns"
              className="px-1.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              Patterns
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="px-1.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              ปฏิทิน
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="px-1.5 py-2 text-xs sm:px-3 sm:text-sm"
            >
              แผนที่
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="space-y-4 sm:space-y-6 max-w-full"
          >
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
              <div className="card-minimal space-y-3 sm:space-y-4 border border-amber-200/60 bg-gradient-to-br from-[#fffaf0] via-white to-[#f7fcff] p-3 sm:p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-sm font-semibold">
                    Character & Threat Builder
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    เพิ่มข้อมูลเข้าฐานโดยตรง
                  </span>
                </div>
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                  <form
                    className="space-y-3 rounded-xl border border-slate-200/70 bg-white/80 p-3 sm:p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAddEntity();
                    }}
                  >
                    <div>
                      <h3 className="text-sm font-medium">เพิ่มตัวละคร</h3>
                      <p className="text-xs text-muted-foreground">
                        ใช้ใน Character Encyclopedia และสถิติ Top Entities
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entityName">ชื่อตัวละคร</Label>
                      <Input
                        id="entityName"
                        value={entityDraft.name}
                        onChange={(event) =>
                          setEntityDraft((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="เช่น ผู้เฝ้ามองไร้เงา"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>บทบาท</Label>
                      <Select
                        value={entityDraft.role}
                        onValueChange={(value) =>
                          setEntityDraft((prev) => ({
                            ...prev,
                            role: value as Entity["role"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENTITY_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entityDesc">คำอธิบาย (optional)</Label>
                      <Textarea
                        id="entityDesc"
                        value={entityDraft.description}
                        onChange={(event) =>
                          setEntityDraft((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="นิสัย / ลักษณะเด่น"
                        className="min-h-[84px]"
                      />
                    </div>
                    <Button type="submit" disabled={addingEntity || refreshing}>
                      {addingEntity ? "กำลังเพิ่ม..." : "เพิ่มตัวละคร"}
                    </Button>
                  </form>

                  <form
                    className="space-y-3 rounded-xl border border-slate-200/70 bg-white/80 p-3 sm:p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleAddThreat();
                    }}
                  >
                    <div>
                      <h3 className="text-sm font-medium">
                        เพิ่ม Threat + ความสามารถ
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ความสามารถจะแสดงใน Threat Analysis ทันที
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threatName">ชื่อ threat</Label>
                      <Input
                        id="threatName"
                        value={threatDraft.name}
                        onChange={(event) =>
                          setThreatDraft((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="เช่น เงาสะท้อนเจาะเวลา"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ระดับ threat</Label>
                      <Select
                        value={threatDraft.level}
                        onValueChange={(value) =>
                          setThreatDraft((prev) => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((level) => (
                            <SelectItem key={level} value={String(level)}>
                              Level {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threatAbility">
                        ความสามารถ / วิธีรับมือ (optional)
                      </Label>
                      <Textarea
                        id="threatAbility"
                        value={threatDraft.response}
                        onChange={(event) =>
                          setThreatDraft((prev) => ({
                            ...prev,
                            response: event.target.value,
                          }))
                        }
                        placeholder="เช่น ดูดพลังความจำ, ลวงเวลา"
                        className="min-h-[84px]"
                      />
                    </div>
                    <Button type="submit" disabled={addingThreat || refreshing}>
                      {addingThreat ? "กำลังเพิ่ม..." : "เพิ่ม threat"}
                    </Button>
                  </form>
                </div>
              </div>
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={480} duration={400}>
              <ThreatDistribution dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={560} duration={400}>
              <TopWorldsList worlds={worlds} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={640} duration={400}>
              <TopEntitiesList entities={entities} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={720} duration={400}>
              <ThreatAnalysis threats={threats} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={800} duration={400}>
              <TimeSystemUsage dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={880} duration={400}>
              <TopEnvironments dreams={dreams} />
            </AnimatedStatsSection>
            <AnimatedStatsSection delay={960} duration={400}>
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

          <TabsContent value="calendar" className="space-y-6">
            <AnimatedStatsSection delay={100} duration={400}>
              <CalendarView dreams={dreams} />
            </AnimatedStatsSection>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <AnimatedStatsSection delay={100} duration={400}>
              <DreamMap dreams={dreams} />
            </AnimatedStatsSection>
          </TabsContent>
        </Tabs>
      </AnimatedStatsSection>
    </div>
  );
}
