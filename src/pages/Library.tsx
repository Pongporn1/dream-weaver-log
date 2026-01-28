import { useState, useEffect } from "react";
import {
  Search,
  Home,
  Book,
  Library as LibraryIcon,
  BarChart3,
  Info,
  Calendar,
  Globe,
  ChevronDown,
  ChevronUp,
  Shuffle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDreamLogs } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { Link, useLocation } from "react-router-dom";
import { format, isToday, isThisWeek, isThisMonth, startOfDay } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AnimatedBookCover } from "@/components/AnimatedBookCover";
import {
  getSessionPhenomenon,
  clearSessionPhenomenon,
} from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/logs", icon: Book, label: "Logs" },
  { path: "/library", icon: LibraryIcon, label: "Library" },
  { path: "/statistics", icon: BarChart3, label: "Stats" },
  { path: "/about", icon: Info, label: "About" },
];

type GroupBy = "date" | "world";

// Generate cover image from dream data
function generateCoverImage(dream: DreamLog): string {
  const colors = [
    "from-cyan-600 via-blue-700 to-blue-900", // Water/Ocean
    "from-purple-600 via-indigo-700 to-purple-900", // Mystery
    "from-emerald-600 via-teal-700 to-green-900", // Forest
    "from-orange-600 via-red-700 to-pink-900", // Fire/Sunset
    "from-slate-600 via-gray-700 to-slate-900", // Urban/Night
    "from-amber-600 via-yellow-700 to-orange-900", // Desert
    "from-rose-600 via-pink-700 to-purple-900", // Dream
    "from-teal-600 via-cyan-700 to-blue-900", // Sky
  ];

  const hash = dream.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Get background pattern based on dream content
function getBackgroundPattern(dream: DreamLog): string {
  const world = dream.world?.toLowerCase() || "";
  const notes = dream.notes?.toLowerCase() || "";
  const content = world + notes;

  if (
    content.includes("น้ำ") ||
    content.includes("water") ||
    content.includes("ทะเล") ||
    content.includes("sea")
  ) {
    return "🌊";
  }
  if (
    content.includes("ไฟ") ||
    content.includes("fire") ||
    content.includes("แสง") ||
    content.includes("light")
  ) {
    return "🔥";
  }
  if (
    content.includes("ป่า") ||
    content.includes("forest") ||
    content.includes("ต้นไม้") ||
    content.includes("tree")
  ) {
    return "🌲";
  }
  if (
    content.includes("เมือง") ||
    content.includes("city") ||
    content.includes("อาคาร") ||
    content.includes("building")
  ) {
    return "🏙️";
  }
  if (
    content.includes("ท้องฟ้า") ||
    content.includes("sky") ||
    content.includes("เมgh") ||
    content.includes("cloud")
  ) {
    return "☁️";
  }
  if (
    content.includes("ดาว") ||
    content.includes("star") ||
    content.includes("จันทร์") ||
    content.includes("moon")
  ) {
    return "✨";
  }
  return "🌙";
}

export default function Library() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [dreamLogs, setDreamLogs] = useState<DreamLog[]>([]);
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

  // Load phenomenon on mount
  useEffect(() => {
    const phenomenon = getSessionPhenomenon();
    setCurrentPhenomenon(phenomenon);
  }, []);

  // Function to change phenomenon (for testing)
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
      }
    };
    loadData();
  }, []);

  const filteredDreams = searchQuery
    ? dreamLogs.filter(
        (dream) =>
          dream.world.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dream.entities.some((e) =>
            e.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          dream.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : dreamLogs;

  // Group dreams by date
  const groupedByDate = () => {
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
  };

  // Group dreams by world
  const groupedByWorld = () => {
    const groups: Record<string, DreamLog[]> = {};
    filteredDreams.forEach((dream) => {
      const world = dream.world || "Unknown World";
      if (!groups[world]) {
        groups[world] = [];
      }
      groups[world].push(dream);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAllInGroup = (worldName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [worldName]: !prev[worldName],
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold">Dream Library</h1>
              {currentPhenomenon && (
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: currentPhenomenon.uiAccent }}
                    />
                    {currentPhenomenon.name}
                  </span>
                  <span className="opacity-60">
                    ({currentPhenomenon.rarity})
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={changePhenomenon}
                className="h-8 px-2"
                title="เปลี่ยนปรากฏการณ์ดวงจันทร์"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <div className="text-sm text-muted-foreground">
                {filteredDreams.length} ความฝัน
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาในห้องสมุดความฝัน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Group By Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy("date")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                groupBy === "date"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="w-4 h-4" />
              ตามวันที่
            </button>
            <button
              onClick={() => setGroupBy("world")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                groupBy === "world"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Globe className="w-4 h-4" />
              ตามโลก
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {filteredDreams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground px-4">
            <LibraryIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>ไม่พบความฝัน</p>
          </div>
        ) : groupBy === "date" ? (
          <div className="space-y-4 p-4">
            {/* Today */}
            {groupedByDate().today.length > 0 && (
              <section className="bg-card rounded-lg border">
                <button
                  onClick={() => toggleSection("today")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-primary rounded-full" />
                    <div className="text-left">
                      <h2 className="text-sm font-semibold">วันนี้</h2>
                      <p className="text-xs text-muted-foreground">
                        {groupedByDate().today.length} ความฝัน
                      </p>
                    </div>
                  </div>
                  {expandedSections.today ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.today && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedByDate().today.map((dream) => (
                        <AnimatedBookCover key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* This Week */}
            {groupedByDate().thisWeek.length > 0 && (
              <section className="bg-card rounded-lg border">
                <button
                  onClick={() => toggleSection("thisWeek")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-blue-500 rounded-full" />
                    <div className="text-left">
                      <h2 className="text-sm font-semibold">สัปดาห์นี้</h2>
                      <p className="text-xs text-muted-foreground">
                        {groupedByDate().thisWeek.length} ความฝัน
                      </p>
                    </div>
                  </div>
                  {expandedSections.thisWeek ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.thisWeek && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedByDate().thisWeek.map((dream) => (
                        <AnimatedBookCover key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* This Month */}
            {groupedByDate().thisMonth.length > 0 && (
              <section className="bg-card rounded-lg border">
                <button
                  onClick={() => toggleSection("thisMonth")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                    <div className="text-left">
                      <h2 className="text-sm font-semibold">เดือนนี้</h2>
                      <p className="text-xs text-muted-foreground">
                        {groupedByDate().thisMonth.length} ความฝัน
                      </p>
                    </div>
                  </div>
                  {expandedSections.thisMonth ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.thisMonth && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedByDate().thisMonth.map((dream) => (
                        <AnimatedBookCover key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Older */}
            {groupedByDate().older.length > 0 && (
              <section className="bg-card rounded-lg border">
                <button
                  onClick={() => toggleSection("older")}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-muted-foreground/50 rounded-full" />
                    <div className="text-left">
                      <h2 className="text-sm font-semibold">ก่อนหน้านี้</h2>
                      <p className="text-xs text-muted-foreground">
                        {groupedByDate().older.length} ความฝัน
                      </p>
                    </div>
                  </div>
                  {expandedSections.older ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.older && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedByDate().older.map((dream) => (
                        <AnimatedBookCover key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {groupedByWorld().map(([world, dreams]) => (
              <section key={world} className="bg-card rounded-lg border">
                <button
                  onClick={() => toggleAllInGroup(world)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <h2 className="text-sm font-semibold">{world}</h2>
                      <p className="text-xs text-muted-foreground">
                        {dreams.length} ความฝัน
                      </p>
                    </div>
                  </div>
                  {expandedSections[world] ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections[world] && (
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dreams.map((dream) => (
                        <AnimatedBookCover key={dream.id} dream={dream} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-20">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive =
              location.pathname === path ||
              (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors min-w-[60px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
