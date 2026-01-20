import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DreamCard } from "@/components/DreamCard";
import { getDreamLogs, getWorlds } from "@/lib/api";
import { DreamLog, World, TIME_SYSTEMS, SAFETY_OVERRIDES } from "@/types/dream";

export default function DreamLogs() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [worldFilter, setWorldFilter] = useState<string>("all");
  const [threatFilter, setThreatFilter] = useState<string>("all");
  const [timeSystemFilter, setTimeSystemFilter] = useState<string>("all");
  const [safetyFilter, setSafetyFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dreamsData, worldsData] = await Promise.all([
          getDreamLogs(),
          getWorlds(),
        ]);
        setDreams(dreamsData);
        setWorlds(worldsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredDreams = dreams.filter((dream) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        dream.world.toLowerCase().includes(query) ||
        dream.notes?.toLowerCase().includes(query) ||
        dream.entities.some((e) => e.toLowerCase().includes(query)) ||
        dream.environments.some((e) => e.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Other filters
    if (worldFilter !== "all" && dream.world !== worldFilter) return false;
    if (threatFilter !== "all" && dream.threatLevel !== Number(threatFilter))
      return false;
    if (timeSystemFilter !== "all" && dream.timeSystem !== timeSystemFilter)
      return false;
    if (safetyFilter !== "all" && dream.safetyOverride !== safetyFilter)
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1>Dream Logs</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button asChild size="sm">
            <Link to="/logs/new">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ค้นหา dreams... (world, notes, entities, environments)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="card-minimal space-y-3">
          <p className="text-sm font-medium">Filters</p>
          <div className="grid grid-cols-2 gap-2">
            <Select value={worldFilter} onValueChange={setWorldFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="World" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Worlds</SelectItem>
                {worlds.map((w) => (
                  <SelectItem key={w.id} value={w.name}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={threatFilter} onValueChange={setThreatFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Threat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threats</SelectItem>
                {[0, 1, 2, 3, 4, 5].map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    Level {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={timeSystemFilter}
              onValueChange={setTimeSystemFilter}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Time System" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {TIME_SYSTEMS.map((ts) => (
                  <SelectItem key={ts} value={ts}>
                    {ts}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={safetyFilter} onValueChange={setSafetyFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Safety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {SAFETY_OVERRIDES.map((so) => (
                  <SelectItem key={so} value={so}>
                    {so}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filteredDreams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>ไม่พบบันทึก</p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/logs/new">สร้างบันทึกใหม่</Link>
            </Button>
          </div>
        ) : (
          filteredDreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))
        )}
      </div>
    </div>
  );
}
