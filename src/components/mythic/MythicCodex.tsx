import React, { useState } from "react";
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
  EyeOff,
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

export function MythicCodex({ className, compact = false }: MythicCodexProps) {
  const {
    collection,
    getMythicMoons,
    getStats,
    toggleFavorite,
    addDurationBoost,
    isDiscovered,
    getParticleConfig,
  } = useMythicCollection();

  const [expandedMoon, setExpandedMoon] = useState<string | null>(null);
  const [showUndiscovered, setShowUndiscovered] = useState(false);

  const mythicMoons = getMythicMoons();
  const stats = getStats();

  const discoveredMoons = mythicMoons.filter((m) => m.discovered);
  const undiscoveredMoons = mythicMoons.filter((m) => !m.discovered);

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

        {/* Compact progress */}
        <MythicProgressBar
          value={stats.mythicCount}
          max={mythicMoons.length}
          particleConfig={
            discoveredMoons[0]
              ? getParticleConfig(discoveredMoons[0].id)
              : null
          }
          height={8}
        />

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

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collection Progress</span>
            <span>
              {stats.totalDiscovered} / {Object.keys(MOON_PHENOMENA).length}
            </span>
          </div>
          <Progress value={stats.completionPercent} className="h-2" />
        </div>

        {/* Rarity breakdown */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {(["mythic", "legendary", "very_rare", "rare", "normal"] as const).map(
            (rarity) => {
              const count =
                rarity === "mythic"
                  ? stats.mythicCount
                  : rarity === "legendary"
                  ? stats.legendaryCount
                  : rarity === "very_rare"
                  ? stats.veryRareCount
                  : rarity === "rare"
                  ? stats.rareCount
                  : stats.normalCount;

              return (
                <div
                  key={rarity}
                  className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    RARITY_COLORS[rarity]
                  )}
                  style={{ opacity: count > 0 ? 1 : 0.4 }}
                >
                  <div className="font-bold text-primary-foreground">{count}</div>
                  <div className="text-[10px] text-primary-foreground/80">
                    {RARITY_LABELS[rarity]}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Discovered Mythic Moons */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Discovered Mythic Moons ({discoveredMoons.length})
        </h4>

        <AnimatePresence>
          {discoveredMoons.map((moon) => {
            const entry = collection[moon.id];
            const isExpanded = expandedMoon === moon.id;
            const particles = getParticleConfig(moon.id);

            return (
              <motion.div
                key={moon.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
                  onClick={() =>
                    setExpandedMoon(isExpanded ? null : moon.id)
                  }
                  className="w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: particles 
                        ? `linear-gradient(135deg, ${particles.color}, ${particles.secondaryColor || particles.color})`
                        : "hsl(var(--primary))",
                    }}
                  >
                    <span className="text-lg">🌙</span>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-medium">{moon.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {moon.nameEn}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-4">
                        {/* Subtitle */}
                        <p className="text-sm italic text-muted-foreground">
                          "{moon.subtitle}"
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>First seen:</span>
                            <span className="text-muted-foreground">
                              {entry?.firstEncountered
                                ? new Date(
                                    entry.firstEncountered
                                  ).toLocaleDateString("th-TH")
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Last seen:</span>
                            <span className="text-muted-foreground">
                              {entry?.lastEncountered
                                ? new Date(
                                    entry.lastEncountered
                                  ).toLocaleDateString("th-TH")
                                : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Theme duration boost */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Theme Duration Boost</span>
                            <span className="text-muted-foreground">
                              +{entry?.themeDurationBoost || 0}s (max 300s)
                            </span>
                          </div>
                          <MythicProgressBar
                            value={entry?.themeDurationBoost || 0}
                            max={300}
                            particleConfig={particles}
                            height={10}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addDurationBoost(moon.id, 30)}
                              disabled={
                                (entry?.themeDurationBoost || 0) >= 300
                              }
                              className="flex-1"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              +30s
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addDurationBoost(moon.id, 60)}
                              disabled={
                                (entry?.themeDurationBoost || 0) >= 300
                              }
                              className="flex-1"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              +60s
                            </Button>
                          </div>
                        </div>

                        {/* Favorite toggle */}
                        <Button
                          size="sm"
                          variant={entry?.isFavorite ? "default" : "outline"}
                          onClick={() => toggleFavorite(moon.id)}
                          className="w-full"
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 mr-2",
                              entry?.isFavorite && "fill-current"
                            )}
                          />
                          {entry?.isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {discoveredMoons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No Mythic moons discovered yet</p>
            <p className="text-xs mt-1">
              Keep exploring to find rare phenomena!
            </p>
          </div>
        )}
      </div>

      {/* Undiscovered Moons Toggle */}
      <div className="space-y-3">
        <button
          onClick={() => setShowUndiscovered(!showUndiscovered)}
          className="w-full flex items-center justify-between text-sm font-medium hover:text-primary transition-colors"
        >
          <span className="flex items-center gap-2">
            {showUndiscovered ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Undiscovered Mythic Moons ({undiscoveredMoons.length})
          </span>
          {showUndiscovered ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {showUndiscovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              {undiscoveredMoons.map((moon) => (
                <div
                  key={moon.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 opacity-60"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">???</div>
                    <div className="text-xs text-muted-foreground">
                      {moon.emotionTag}
                    </div>
                  </div>
                  <Badge variant="outline" className="opacity-50">
                    Mythic
                  </Badge>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
