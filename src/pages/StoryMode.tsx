import { useState } from "react";
import {
  BookOpen,
  Clock,
  Map,
  Network,
  Users as UsersIcon,
} from "lucide-react";
import { DreamLog, World, Entity } from "@/types/dream";
import { cn } from "@/lib/utils";
import { TimelineView } from "@/components/story/TimelineView";
import { ConnectedDreams } from "@/components/story/ConnectedDreams";
import { DreamUniverseMap } from "@/components/story/DreamUniverseMap";
import { CharacterEncyclopedia } from "@/components/story/CharacterEncyclopedia";
import { AnimatedSection } from "@/components/ui/animated";
import { BottomNavigation } from "@/components/BottomNavigation";

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
          <AnimatedSection delay={0} duration={400}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold">Story Mode</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                {dreams.length} ความฝัน
              </div>
            </div>
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={80} duration={400}>
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
          </AnimatedSection>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          <AnimatedSection delay={160} duration={400}>
            {viewMode === "timeline" && <TimelineView dreams={dreams} />}
            {viewMode === "connected" && (
              <ConnectedDreams dreams={dreams} />
            )}
            {viewMode === "map" && (
              <DreamUniverseMap dreams={dreams} worlds={worlds} />
            )}
            {viewMode === "characters" && (
              <CharacterEncyclopedia dreams={dreams} entities={entities} />
            )}
          </AnimatedSection>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
