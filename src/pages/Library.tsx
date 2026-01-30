import { useState, useEffect, useMemo } from "react";
import { Library as LibraryIcon, Moon, BookOpen } from "lucide-react";
import { getDreamLogs } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { isToday, isThisWeek, isThisMonth } from "date-fns";
import { getSessionPhenomenon, clearSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import type { MoonPhenomenon } from "@/data/moonPhenomena";
import { LibraryPageSkeleton } from "@/components/skeletons/LibrarySkeleton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LibraryHeader, DateSection, WorldSection } from "@/components/library";
import { MythicCodex } from "@/components/mythic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type GroupBy = "date" | "world";
type LibraryTab = "dreams" | "codex";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [activeTab, setActiveTab] = useState<LibraryTab>("dreams");
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    today: true,
    thisWeek: true,
    thisMonth: true,
    older: false,
  });
  const [currentPhenomenon, setCurrentPhenomenon] = useState<MoonPhenomenon | null>(null);

  useEffect(() => {
    const phenomenon = getSessionPhenomenon();
    setCurrentPhenomenon(phenomenon);
  }, []);

  const changePhenomenon = () => {
    clearSessionPhenomenon();
    const newPhenomenon = getSessionPhenomenon();
    setCurrentPhenomenon(newPhenomenon);
    applyMoonTheme(newPhenomenon);
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
          e.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        dream.notes?.toLowerCase().includes(searchQuery.toLowerCase())
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
        onChangePhenomenon={changePhenomenon}
        showDreamFilters={activeTab === "dreams"}
      />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LibraryTab)} className="flex-1 flex flex-col">
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
          <ScrollArea className="h-full pb-28">
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
          <ScrollArea className="h-full pb-28">
            <div className="p-4">
              <MythicCodex />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <BottomNavigation />
    </div>
  );
}
