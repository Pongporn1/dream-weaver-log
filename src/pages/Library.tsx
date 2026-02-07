import { useState, useEffect, useMemo } from "react";
import { Library as LibraryIcon, Moon, BookOpen, Shuffle } from "lucide-react";
import { getDreamLogs } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  getSessionPhenomenon,
  clearSessionPhenomenon,
  isMythicShuffleEnabled,
  setMythicShuffleEnabled,
} from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import type { MoonPhenomenon } from "@/data/moonPhenomena";
import { LibraryPageSkeleton } from "@/components/skeletons/LibrarySkeleton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LibraryHeader, DateSection, WorldSection } from "@/components/library";
import { MythicCodex } from "@/components/mythic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type GroupBy = "date" | "world";
type LibraryTab = "dreams" | "codex";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [activeTab, setActiveTab] = useState<LibraryTab>("dreams");
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    today: true,
    thisWeek: true,
    thisMonth: true,
    older: false,
  });
  const [currentPhenomenon, setCurrentPhenomenon] =
    useState<MoonPhenomenon | null>(null);
  const [isDebugSuperBlue, setIsDebugSuperBlue] = useState(false);
  const [isDebugPixel, setIsDebugPixel] = useState(false);
  const [mythicShuffleEnabled, setMythicShuffleEnabledState] = useState(false);

  const debugMoonId = "superBlueBloodMoon";
  const pixelMoonId = "pixelDreamMoon";
  const lockedMoonKey = "mythic-locked-moon";

  useEffect(() => {
    const { phenomenon } = getSessionPhenomenon();
    setCurrentPhenomenon(phenomenon);
    setIsDebugSuperBlue(
      localStorage.getItem(lockedMoonKey) === debugMoonId,
    );
    setIsDebugPixel(
      localStorage.getItem(lockedMoonKey) === pixelMoonId,
    );
    setMythicShuffleEnabledState(isMythicShuffleEnabled());
  }, []);

  const changePhenomenon = () => {
    clearSessionPhenomenon();
    const { phenomenon: newPhenomenon } = getSessionPhenomenon();
    setCurrentPhenomenon(newPhenomenon);
    applyMoonTheme(newPhenomenon);
  };

  const handleMythicShuffleToggle = (enabled: boolean) => {
    setMythicShuffleEnabled(enabled);
    setMythicShuffleEnabledState(enabled);

    if (enabled) {
      clearSessionPhenomenon();
      const { phenomenon: newPhenomenon } = getSessionPhenomenon();
      setCurrentPhenomenon(newPhenomenon);
      applyMoonTheme(newPhenomenon);
    }
  };

  const handleMythicShuffleNow = () => {
    if (!mythicShuffleEnabled) {
      setMythicShuffleEnabled(true);
      setMythicShuffleEnabledState(true);
    }
    clearSessionPhenomenon();
    const { phenomenon: newPhenomenon } = getSessionPhenomenon();
    setCurrentPhenomenon(newPhenomenon);
    applyMoonTheme(newPhenomenon);
  };

  const toggleDebugSuperBlue = () => {
    if (isDebugSuperBlue) {
      localStorage.removeItem(lockedMoonKey);
      clearSessionPhenomenon();
      const { phenomenon: newPhenomenon } = getSessionPhenomenon();
      setCurrentPhenomenon(newPhenomenon);
      applyMoonTheme(newPhenomenon);
      setIsDebugSuperBlue(false);
      return;
    }

    localStorage.setItem(lockedMoonKey, debugMoonId);
    const { phenomenon: lockedPhenomenon } = getSessionPhenomenon();
    setCurrentPhenomenon(lockedPhenomenon);
    applyMoonTheme(lockedPhenomenon);
    setIsDebugSuperBlue(true);
    setIsDebugPixel(false);
  };

  const toggleDebugPixelMoon = () => {
    if (localStorage.getItem(lockedMoonKey) === pixelMoonId) {
      localStorage.removeItem(lockedMoonKey);
      clearSessionPhenomenon();
      const { phenomenon: newPhenomenon } = getSessionPhenomenon();
      setCurrentPhenomenon(newPhenomenon);
      applyMoonTheme(newPhenomenon);
      setIsDebugPixel(false);
      return;
    }

    localStorage.setItem(lockedMoonKey, pixelMoonId);
    const { phenomenon: lockedPhenomenon } = getSessionPhenomenon();
    setCurrentPhenomenon(lockedPhenomenon);
    applyMoonTheme(lockedPhenomenon);
    setIsDebugSuperBlue(false);
    setIsDebugPixel(true);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const dreamsData = await getDreamLogs();
        setDreamLogs(dreamsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDreams = useMemo(() => {
    if (!searchQuery) return dreamLogs;
    return dreamLogs.filter(
      (dream) =>
        dream.world.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dream.entities.some((e) =>
          e.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        dream.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [dreamLogs, searchQuery]);

  const groupedByDate = useMemo(() => {
    const today: DreamLog[] = [];
    const thisWeek: DreamLog[] = [];
    const thisMonth: DreamLog[] = [];
    const older: DreamLog[] = [];

    filteredDreams.forEach((dream) => {
      const dreamDate = new Date(dream.date);
      if (isToday(dreamDate)) {
        today.push(dream);
      } else if (isThisWeek(dreamDate, { weekStartsOn: 1 })) {
        thisWeek.push(dream);
      } else if (isThisMonth(dreamDate)) {
        thisMonth.push(dream);
      } else {
        older.push(dream);
      }
    });

    return { today, thisWeek, thisMonth, older };
  }, [filteredDreams]);

  const groupedByWorld = useMemo(() => {
    const groups: Record<string, DreamLog[]> = {};
    filteredDreams.forEach((dream) => {
      const world = dream.world || "Unknown World";
      if (!groups[world]) {
        groups[world] = [];
      }
      groups[world].push(dream);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredDreams]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <LibraryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        totalDreams={filteredDreams.length}
        currentPhenomenon={currentPhenomenon}
        showDreamFilters={activeTab === "dreams"}
      />
      {import.meta.env.DEV && (
        <div className="px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={isDebugSuperBlue ? "default" : "outline"}
                size="sm"
                onClick={toggleDebugSuperBlue}
                className="h-8"
                title="Debug: สลับเป็น Super Blue Blood Moon ชั่วคราว"
              >
                {isDebugSuperBlue
                  ? "Debug: Super Blue Blood (ON)"
                  : "Debug: Super Blue Blood"}
              </Button>
              <Button
                variant={isDebugPixel ? "default" : "outline"}
                size="sm"
                onClick={toggleDebugPixelMoon}
                className="h-8"
                title="Debug: ล็อก Pixel Dream Moon ชั่วคราว"
              >
                {isDebugPixel
                  ? "Debug: Pixel Dream (ON)"
                  : "Debug: Pixel Dream"}
              </Button>
              
            </div>
            
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as LibraryTab)}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsList className="w-full h-12 bg-transparent gap-2">
            <TabsTrigger
              value="dreams"
              className="flex-1 gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <BookOpen className="h-4 w-4" />
              <span>Dream Logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="codex"
              className="flex-1 gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Moon className="h-4 w-4" />
              <span>Mythic Codex</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dreams" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full pb-28 relative z-0">
            {loading ? (
              <LibraryPageSkeleton />
            ) : filteredDreams.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <LibraryIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>ไม่พบความฝัน</p>
              </div>
            ) : groupBy === "date" ? (
              <div className="space-y-4 p-4">
                <DateSection
                  title="วันนี้"
                  dreams={groupedByDate.today}
                  colorClass="bg-primary"
                  isExpanded={expandedSections.today}
                  onToggle={() => toggleSection("today")}
                />
                <DateSection
                  title="สัปดาห์นี้"
                  dreams={groupedByDate.thisWeek}
                  colorClass="bg-blue-500"
                  isExpanded={expandedSections.thisWeek}
                  onToggle={() => toggleSection("thisWeek")}
                />
                <DateSection
                  title="เดือนนี้"
                  dreams={groupedByDate.thisMonth}
                  colorClass="bg-emerald-500"
                  isExpanded={expandedSections.thisMonth}
                  onToggle={() => toggleSection("thisMonth")}
                />
                <DateSection
                  title="ก่อนหน้านี้"
                  dreams={groupedByDate.older}
                  colorClass="bg-muted-foreground/50"
                  isExpanded={expandedSections.older}
                  onToggle={() => toggleSection("older")}
                />
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {groupedByWorld.map(([world, dreams]) => (
                  <WorldSection
                    key={world}
                    worldName={world}
                    dreams={dreams}
                    isExpanded={expandedSections[world] ?? true}
                    onToggle={() => toggleSection(world)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="codex" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full pb-28 relative z-0">
            <div className="p-4">
              <div className="card-minimal mb-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Shuffle className="h-4 w-4 text-primary" />
                      Mythic Shuffle
                    </div>
                    <p className="text-xs text-muted-foreground">
                      สุ่มสลับเฉพาะธีมระดับ Mythic ที่ค้นพบ
                    </p>
                  </div>
                  <Switch
                    checked={mythicShuffleEnabled}
                    onCheckedChange={handleMythicShuffleToggle}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMythicShuffleNow}
                    className="h-8"
                  >
                    <Shuffle className="h-4 w-4 mr-1" />
                    สลับตอนนี้
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {mythicShuffleEnabled
                      ? "กำลังสุ่มอัตโนมัติ"
                      : "ปิดอยู่"}
                  </span>
                </div>
              </div>
              <MythicCodex />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <BottomNavigation />
    </div>
  );
}
