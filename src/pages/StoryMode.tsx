import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Home,
  Book,
  Library as LibraryIcon,
  BarChart3,
  Info,
  Clock,
  Map,
  Network,
  Users as UsersIcon,
} from "lucide-react";
import { DreamLog, World, Entity } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimelineView } from "@/components/story/TimelineView";
import { ConnectedDreams } from "@/components/story/ConnectedDreams";
import { DreamUniverseMap } from "@/components/story/DreamUniverseMap";
import { CharacterEncyclopedia } from "@/components/story/CharacterEncyclopedia";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/logs", icon: Book, label: "Logs" },
  { path: "/library", icon: LibraryIcon, label: "Library" },
  { path: "/statistics", icon: BarChart3, label: "Stats" },
  { path: "/about", icon: Info, label: "About" },
];

interface Props {
  dreams: DreamLog[];
  worlds: World[];
  entities: Entity[];
}

type ViewMode = "timeline" | "connected" | "map" | "characters";

export function StoryMode({ dreams, worlds, entities }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");

  const tabs = [
    { id: "timeline" as const, label: "Timeline", icon: Clock },
    { id: "connected" as const, label: "Connected Dreams", icon: Network },
    { id: "map" as const, label: "Universe Map", icon: Map },
    { id: "characters" as const, label: "Characters", icon: UsersIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Story Mode</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {dreams.length} ความฝัน
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  viewMode === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4">
          {viewMode === "timeline" && <TimelineView dreams={dreams} />}
          {viewMode === "connected" && (
            <ConnectedDreams dreams={dreams} worlds={worlds} />
          )}
          {viewMode === "map" && (
            <DreamUniverseMap dreams={dreams} worlds={worlds} />
          )}
          {viewMode === "characters" && (
            <CharacterEncyclopedia dreams={dreams} entities={entities} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 bg-background border-t">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                item.path === "/story"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
