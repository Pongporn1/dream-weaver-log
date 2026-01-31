import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MythicProgressBar } from "./MythicProgressBar";
import { useMythicCollection, MYTHIC_PARTICLE_CONFIGS } from "@/hooks/useMythicCollection";
import { MOON_PHENOMENA } from "@/data/moonPhenomena";
import {
  Star,
  Lock,
  Heart,
  Clock,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";

interface MythicCodexProps {
  className?: string;
  compact?: boolean;
}

const RARITY_COLORS = {
  mythic: "from-purple-500 via-pink-500 to-rose-500",
  legendary: "from-amber-400 via-orange-500 to-red-500",
  very_rare: "from-blue-400 via-indigo-500 to-purple-500",
  rare: "from-cyan-400 via-teal-500 to-emerald-500",
  normal: "from-slate-400 via-gray-500 to-zinc-500",
};

const RARITY_LABELS = {
  mythic: "Mythic",
  legendary: "Legendary",
  very_rare: "Very Rare",
  rare: "Rare",
  normal: "Normal",
};

// Pre-defined particle showcase configs (static to avoid re-renders)
const PARTICLE_SHOWCASE = [
  { type: "stars" as const, label: "Starfall", color: "#3b82f6", secondary: "#93c5fd", value: 75 },
  { type: "fire" as const, label: "Inferno", color: "#f97316", secondary: "#fbbf24", value: 85 },
  { type: "snow" as const, label: "Frostbite", color: "#38bdf8", secondary: "#e0f2fe", value: 70 },
  { type: "crystals" as const, label: "Crystal", color: "#818cf8", secondary: "#c4b5fd", value: 80 },
  { type: "void" as const, label: "Void", color: "#7c3aed", secondary: "#4c1d95", value: 65 },
  { type: "aurora" as const, label: "Aurora", color: "#14b8a6", secondary: "#ec4899", value: 90 },
  { type: "lightning" as const, label: "Thunder", color: "#fef08a", secondary: "#38bdf8", value: 78 },
  { type: "blood" as const, label: "Crimson", color: "#dc2626", secondary: "#b91c1c", value: 72 },
];

// Memoized moon card component to prevent unnecessary re-renders
const MoonCard = React.memo(function MoonCard({
  moon,
  entry,
  isExpanded,
  onToggleExpand,
  onToggleFavorite,
  onAddBoost,
  particles,
}: {
  moon: any;
  entry: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onAddBoost: (seconds: number) => void;
  particles: any;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-gradient-to-br from-card via-card to-background"
      )}
      style={{
        borderColor: particles?.color + "40",
        boxShadow: particles?.glow
          ? `0 0 20px ${particles.color}20`
          : undefined,
      }}
    >
      {/* Moon header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: particles 
              ? `linear-gradient(135deg, ${particles.color}, ${particles.secondaryColor || particles.color})`
              : "hsl(var(--primary))",
          }}
        >
          <span className="text-lg">🌙</span>
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="font-medium truncate">{moon.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {moon.nameEn}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20"
          >
            ×{entry?.encounterCount || 0}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Expanded content - no AnimatePresence to reduce overhead */}
      {isExpanded && (
        <div className="border-t animate-fade-in">
          <div className="p-4 space-y-4">
            {/* Subtitle */}
            <p className="text-sm italic text-muted-foreground">
              "{moon.subtitle}"
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">First seen:</span>
                <span className="text-muted-foreground truncate">
                  {entry?.firstEncountered
                    ? new Date(entry.firstEncountered).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">Last seen:</span>
                <span className="text-muted-foreground truncate">
                  {entry?.lastEncountered
                    ? new Date(entry.lastEncountered).toLocaleDateString("th-TH")
                    : "-"}
                </span>
              </div>
            </div>

            {/* Theme duration boost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Theme Duration Boost</span>
                <span className="text-muted-foreground">
                  +{formatDuration(entry?.themeDurationBoost || 0)} (max 1 day)
                </span>
              </div>
              <MythicProgressBar
                value={entry?.themeDurationBoost || 0}
                max={86400}
                particleConfig={particles}
                height={10}
                animated={false} // Disable animation for expanded cards
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddBoost(3600)}
                  disabled={(entry?.themeDurationBoost || 0) >= 86400}
                  className="flex-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  +1h
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddBoost(21600)}
                  disabled={(entry?.themeDurationBoost || 0) >= 86400}
                  className="flex-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  +6h
                </Button>
              </div>
            </div>

            {/* Favorite toggle */}
            <Button
              size="sm"
              variant={entry?.isFavorite ? "default" : "outline"}
              onClick={onToggleFavorite}
              className="w-full"
            >
              <Heart
                className={cn(
                  "h-4 w-4 mr-2",
                  entry?.isFavorite && "fill-current"
                )}
              />
              {entry?.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

// Helper function to format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function MythicCodex({ className, compact = false }: MythicCodexProps) {
  const {
    collection,
    getMythicMoons,
    getStats,
    toggleFavorite,
    addDurationBoost,
    getParticleConfig,
  } = useMythicCollection();

  const [expandedMoon, setExpandedMoon] = useState<string | null>(null);
  const [showUndiscovered, setShowUndiscovered] = useState(false);
  const [showParticleShowcase, setShowParticleShowcase] = useState(false);

  // Memoize expensive calculations
  const mythicMoons = useMemo(() => getMythicMoons(), [getMythicMoons]);
  const stats = useMemo(() => getStats(), [getStats]);

  const discoveredMoons = useMemo(
    () => mythicMoons.filter((m) => m.discovered),
    [mythicMoons]
  );
  const undiscoveredMoons = useMemo(
    () => mythicMoons.filter((m) => !m.discovered),
    [mythicMoons]
  );

  // Memoize rarity counts
  const rarityCounts = useMemo(() => {
    return {
      mythic: { count: stats.mythicCount, max: mythicMoons.length },
      legendary: { count: stats.legendaryCount, max: Object.values(MOON_PHENOMENA).filter(m => m.rarity === "legendary").length },
      very_rare: { count: stats.veryRareCount, max: Object.values(MOON_PHENOMENA).filter(m => m.rarity === "very_rare").length },
      rare: { count: stats.rareCount, max: Object.values(MOON_PHENOMENA).filter(m => m.rarity === "rare").length },
      normal: { count: stats.normalCount, max: Object.values(MOON_PHENOMENA).filter(m => m.rarity === "normal").length },
    };
  }, [stats, mythicMoons.length]);

  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Compact stats header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Mythic Collection</span>
          </div>
          <Badge variant="secondary">
            {stats.mythicCount} / {mythicMoons.length}
          </Badge>
        </div>

        {/* Compact progress - no particles for performance */}
        <Progress value={(stats.mythicCount / mythicMoons.length) * 100} className="h-2" />

        {/* Mini moon grid */}
        <div className="flex flex-wrap gap-2">
          {mythicMoons.slice(0, 6).map((moon) => (
            <div
              key={moon.id}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                moon.discovered
                  ? "bg-gradient-to-br " + RARITY_COLORS.mythic
                  : "bg-muted"
              )}
              title={moon.discovered ? moon.name : "???"}
            >
              {moon.discovered ? (
                <span className="text-white">✓</span>
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          ))}
          {mythicMoons.length > 6 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              +{mythicMoons.length - 6}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Mythic Codex</h3>
              <p className="text-xs text-muted-foreground">
                {stats.totalEncounters} total encounters
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10"
          >
            {stats.completionPercent}% Complete
          </Badge>
        </div>

        {/* Overall progress - simple version */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collection Progress</span>
            <span>
              {stats.totalDiscovered} / {Object.keys(MOON_PHENOMENA).length}
            </span>
          </div>
          <Progress value={stats.completionPercent} className="h-2" />
        </div>

        {/* Rarity breakdown - simplified progress bars */}
        <div className="space-y-3">
          {(["mythic", "legendary", "very_rare", "rare", "normal"] as const).map((rarity) => {
            const { count, max } = rarityCounts[rarity];
            const percent = max > 0 ? (count / max) * 100 : 0;

            return (
              <div key={rarity} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={cn(
                    "font-medium px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                    RARITY_COLORS[rarity]
                  )}>
                    {RARITY_LABELS[rarity]}
                  </span>
                  <span className="text-muted-foreground">
                    {count} / {max}
                  </span>
                </div>
                {/* Use simple Progress instead of MythicProgressBar for performance */}
                <div className="h-3 rounded-full overflow-hidden bg-secondary/50">
                  <div 
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                      RARITY_COLORS[rarity]
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible particle showcase */}
        <div className="pt-4 border-t">
          <button
            onClick={() => setShowParticleShowcase(!showParticleShowcase)}
            className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Particle Effect Showcase
            </span>
            {showParticleShowcase ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {showParticleShowcase && (
            <div className="grid gap-3 mt-3 animate-fade-in">
              {PARTICLE_SHOWCASE.map((effect) => (
                <div key={effect.type} className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {effect.label}
                  </span>
                  <MythicProgressBar
                    value={effect.value}
                    max={100}
                    variant={effect.type}
                    height={14}
                    showGlow
                    animated
                    particleConfig={{
                      type: effect.type,
                      color: effect.color,
                      secondaryColor: effect.secondary,
                      density: 0.6, // Reduced density for performance
                      speed: 1.2,
                      glow: true,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Discovered Mythic Moons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Discovered Mythic Moons ({discoveredMoons.length})
        </h4>

        <div className="space-y-3">
          {discoveredMoons.map((moon) => {
            const entry = collection[moon.id];
            const isExpanded = expandedMoon === moon.id;
            const particles = getParticleConfig(moon.id);

            return (
              <MoonCard
                key={moon.id}
                moon={moon}
                entry={entry}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedMoon(isExpanded ? null : moon.id)}
                onToggleFavorite={() => toggleFavorite(moon.id)}
                onAddBoost={(seconds) => addDurationBoost(moon.id, seconds)}
                particles={particles}
              />
            );
          })}
        </div>

        {discoveredMoons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No Mythic moons discovered yet</p>
            <p className="text-xs mt-1">
              Keep exploring to find rare moon phenomena!
            </p>
          </div>
        )}
      </div>

      {/* Undiscovered section */}
      <div className="space-y-3">
        <button
          onClick={() => setShowUndiscovered(!showUndiscovered)}
          className="w-full flex items-center justify-between text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Undiscovered ({undiscoveredMoons.length})
          </span>
          {showUndiscovered ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showUndiscovered && (
          <div className="grid grid-cols-2 gap-2 animate-fade-in">
            {undiscoveredMoons.map((moon) => (
              <div
                key={moon.id}
                className="p-3 rounded-lg bg-muted/50 border border-dashed flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">???</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
