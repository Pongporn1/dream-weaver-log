import { Search, Calendar, Globe, Shuffle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MoonPhenomenon } from "@/data/moonPhenomena";

type GroupBy = "date" | "world";

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  totalDreams: number;
  currentPhenomenon: MoonPhenomenon | null;
  onChangePhenomenon: () => void;
  showDreamFilters?: boolean;
}

export function LibraryHeader({
  searchQuery,
  onSearchChange,
  groupBy,
  onGroupByChange,
  totalDreams,
  currentPhenomenon,
  onChangePhenomenon,
  showDreamFilters = true,
}: LibraryHeaderProps) {
  return (
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
            {/* <Button
              variant="outline"
              size="sm"
              onClick={onChangePhenomenon}
              className="h-8 px-2"
              title="เปลี่ยนปรากฏการณ์ดวงจันทร์"
            >
              <Shuffle className="w-4 h-4" />
            </Button> */}
            <div className="text-sm text-muted-foreground">
              {totalDreams} ความฝัน
            </div>
          </div>
        </div>

        {/* Search Bar - Only show when on dreams tab */}
        {showDreamFilters && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาในห้องสมุดความฝัน..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Group By Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => onGroupByChange("date")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  groupBy === "date"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="w-4 h-4" />
                ตามวันที่
              </button>
              <button
                onClick={() => onGroupByChange("world")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  groupBy === "world"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="w-4 h-4" />
                ตามโลก
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
