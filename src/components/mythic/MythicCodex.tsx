import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MythicProgressBar } from "./MythicProgressBar";
import {
  useMythicCollection,
  MYTHIC_PARTICLE_CONFIGS,
} from "@/hooks/useMythicCollection";
import { MOON_PHENOMENA } from "@/data/moonPhenomena";
import {
  Star,
  Lock,
  Unlock,
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
  {
    type: "stars" as const,
    label: "Starfall",
    color: "#3b82f6",
    secondary: "#93c5fd",
    value: 75,
  },
  {
    type: "fire" as const,
    label: "Inferno",
    color: "#f97316",
    secondary: "#fbbf24",
    value: 85,
  },
  {
    type: "snow" as const,
    label: "Frostbite",
    color: "#38bdf8",
    secondary: "#e0f2fe",
    value: 70,
  },
  {
    type: "crystals" as const,
    label: "Crystal",
    color: "#818cf8",
    secondary: "#c4b5fd",
    value: 80,
  },
  {
    type: "void" as const,
    label: "Void",
    color: "#7c3aed",
    secondary: "#4c1d95",
    value: 65,
  },
  {
    type: "aurora" as const,
    label: "Aurora",
    color: "#14b8a6",
    secondary: "#ec4899",
    value: 90,
  },
  {
    type: "lightning" as const,
    label: "Thunder",
    color: "#fef08a",
    secondary: "#38bdf8",
    value: 78,
  },
  {
    type: "blood" as const,
    label: "Crimson",
    color: "#dc2626",
    secondary: "#b91c1c",
    value: 72,
  },
];

const CODEX_THEME = {
  "--codex-ink": "9, 11, 23",
  "--codex-aurora": "90, 209, 255",
  "--codex-ember": "255, 183, 110",
  "--codex-orchid": "194, 132, 255",
} as React.CSSProperties;

const CODEX_TITLE_STYLE = {
  fontFamily: '"DM Serif Display", "Space Grotesk", serif',
} as React.CSSProperties;

const CODEX_BODY_STYLE = {
  fontFamily: '"Space Grotesk", "Inter", sans-serif',
} as React.CSSProperties;

const STAGGER_CONTAINER = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// Memoized moon card component to prevent unnecessary re-renders
const MoonCard = React.memo(function MoonCard({
  moon,
  entry,
  isExpanded,
  onToggleExpand,
  onToggleFavorite,
  onToggleLock,
  onAddBoost,
  particles,
}: {
  moon: any;
  entry: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onToggleLock: () => void;
  onAddBoost: (seconds: number) => void;
  particles: any;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-white/5 backdrop-blur-sm",
        "shadow-[0_12px_40px_rgba(6,8,20,0.45)]",
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
        className="w-full p-4 flex items-center gap-3 hover:bg-white/10 transition-colors"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: particles
              ? `linear-gradient(135deg, ${particles.color}, ${particles.secondaryColor || particles.color})`
              : "hsl(var(--primary))",
            boxShadow: particles?.glow
              ? `0 0 14px ${particles.color}55`
              : "0 0 12px rgba(255,255,255,0.15)",
          }}
        >
          <span className="text-lg">🌙</span>
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold text-white truncate">{moon.name}</div>
          <div className="text-xs text-white/60 truncate">
            {moon.nameEn}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-cyan-400/20 to-amber-300/20 text-white"
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
                    ? new Date(entry.firstEncountered).toLocaleDateString(
                        "th-TH",
                      )
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">Last seen:</span>
                <span className="text-muted-foreground truncate">
                  {entry?.lastEncountered
                    ? new Date(entry.lastEncountered).toLocaleDateString(
                        "th-TH",
                      )
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
                  disabled={
                    (entry?.encounterCount ?? 0) < 5 ||
                    (entry?.themeDurationBoost || 0) >= 86400
                  }
                  title={
                    (entry?.encounterCount ?? 0) < 5
                      ? `ต้องเจออีก ${5 - (entry?.encounterCount ?? 0)} ครั้ง`
                      : undefined
                  }
                  className="flex-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  +1h
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddBoost(21600)}
                  disabled={
                    (entry?.encounterCount ?? 0) < 5 ||
                    (entry?.themeDurationBoost || 0) >= 86400
                  }
                  title={
                    (entry?.encounterCount ?? 0) < 5
                      ? `ต้องเจออีก ${5 - (entry?.encounterCount ?? 0)} ครั้ง`
                      : undefined
                  }
                  className="flex-1"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  +6h
                </Button>
              </div>
            </div>

            {/* Lock & Favorite buttons */}
            <div className="flex gap-2">
              {/* Lock toggle - permanently lock this moon theme */}
              <Button
                size="sm"
                variant={entry?.isLocked ? "default" : "outline"}
                onClick={onToggleLock}
                disabled={(entry?.encounterCount ?? 0) < 5 && !entry?.isLocked}
                className={cn(
                  "flex-1",
                  entry?.isLocked &&
                    "bg-amber-500 hover:bg-amber-600 text-white",
                )}
                title={
                  (entry?.encounterCount ?? 0) < 5 && !entry?.isLocked
                    ? `ต้องเจอดวงจันทร์นี้อีก ${5 - (entry?.encounterCount ?? 0)} ครั้ง`
                    : undefined
                }
              >
                {entry?.isLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock Theme
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    {(entry?.encounterCount ?? 0) < 5
                      ? `Lock (${entry?.encounterCount ?? 0}/5)`
                      : "Lock Theme"}
                  </>
                )}
              </Button>

              {/* Favorite toggle */}
              <Button
                size="sm"
                variant={entry?.isFavorite ? "default" : "outline"}
                onClick={onToggleFavorite}
                className="flex-1"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 mr-2",
                    entry?.isFavorite && "fill-current",
                  )}
                />
                {entry?.isFavorite ? "Unfavorite" : "Favorite"}
              </Button>
            </div>

            {/* Lock info */}
            {entry?.isLocked && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Theme Locked</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This moon will always be your theme. No random re-rolling.
                </p>
              </div>
            )}
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
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function MythicCodex({ className, compact = false }: MythicCodexProps) {
  const {
    collection,
    getMythicMoons,
    getStats,
    toggleFavorite,
    toggleLock,
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
    [mythicMoons],
  );
  const undiscoveredMoons = useMemo(
    () => mythicMoons.filter((m) => !m.discovered),
    [mythicMoons],
  );

  // Memoize rarity counts
  const rarityCounts = useMemo(() => {
    return {
      mythic: { count: stats.mythicCount, max: mythicMoons.length },
      legendary: {
        count: stats.legendaryCount,
        max: Object.values(MOON_PHENOMENA).filter(
          (m) => m.rarity === "legendary",
        ).length,
      },
      very_rare: {
        count: stats.veryRareCount,
        max: Object.values(MOON_PHENOMENA).filter(
          (m) => m.rarity === "very_rare",
        ).length,
      },
      rare: {
        count: stats.rareCount,
        max: Object.values(MOON_PHENOMENA).filter((m) => m.rarity === "rare")
          .length,
      },
      normal: {
        count: stats.normalCount,
        max: Object.values(MOON_PHENOMENA).filter((m) => m.rarity === "normal")
          .length,
      },
    };
  }, [stats, mythicMoons.length]);

  if (compact) {
    return (
      <div className={cn("space-y-3", className)} style={CODEX_BODY_STYLE}>
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
        <Progress
          value={(stats.mythicCount / mythicMoons.length) * 100}
          className="h-2"
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
                  : "bg-muted",
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
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 p-5 sm:p-8 text-white",
        className,
      )}
      style={CODEX_THEME}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 480px at 10% -10%, rgba(var(--codex-aurora), 0.35), transparent 60%), radial-gradient(700px 420px at 90% 5%, rgba(var(--codex-orchid), 0.28), transparent 55%), linear-gradient(160deg, rgba(var(--codex-ink), 1) 0%, rgba(11, 10, 26, 1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-0 opacity-60 mix-blend-screen animate-[auroraShift_18s_linear_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(var(--codex-aurora),0.25), rgba(var(--codex-ember),0.18), rgba(var(--codex-orchid),0.22))",
          backgroundSize: "200% 200%",
        }}
      />
      <div className="absolute -top-24 -right-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-amber-300/10 blur-[90px]" />

      <div className="relative z-10 space-y-10" style={CODEX_BODY_STYLE}>
        <motion.div
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={FADE_UP}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-300/30 via-white/10 to-amber-200/20 flex items-center justify-center shadow-[0_0_20px_rgba(90,209,255,0.25)]">
                    <span className="text-2xl">☾</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border border-white/30 bg-white/10 backdrop-blur" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                    Mythic Archive
                  </p>
                  <h3
                    className="text-3xl sm:text-4xl text-white"
                    style={CODEX_TITLE_STYLE}
                  >
                    Mythic Codex
                  </h3>
                  <p className="text-sm text-white/70 max-w-md">
                    A living ledger of lunar anomalies. Each encounter reshapes
                    your mythic signature.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                  Rank {stats.completionPercent}%
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                  {stats.totalEncounters} Encounters
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Total Encounters",
                  value: stats.totalEncounters,
                  hint: "dream logs",
                  tint: "rgba(var(--codex-ember),0.18)",
                },
                {
                  label: "Completion",
                  value: `${stats.completionPercent}%`,
                  hint: "overall",
                  tint: "rgba(var(--codex-aurora),0.18)",
                },
                {
                  label: "Discovered",
                  value: stats.totalDiscovered,
                  hint: `of ${Object.keys(MOON_PHENOMENA).length}`,
                  tint: "rgba(var(--codex-orchid),0.18)",
                },
                {
                  label: "Mythic",
                  value: stats.mythicCount,
                  hint: `${mythicMoons.length} total`,
                  tint: "rgba(var(--codex-ember),0.12)",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 px-3 py-3"
                  style={{
                    background: `linear-gradient(135deg, ${stat.tint} 0%, rgba(255,255,255,0.03) 65%)`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-white/55">{stat.hint}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={FADE_UP}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                  Collection Status
                </p>
                <h4 className="text-lg font-semibold text-white">
                  Lunar Registry
                </h4>
              </div>
              <Badge className="bg-white/10 text-white border border-white/15">
                {stats.completionPercent}% Complete
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-xs text-white/70">
                <span>Collection Progress</span>
                <span>
                  {stats.totalDiscovered} / {Object.keys(MOON_PHENOMENA).length}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-amber-200 transition-all duration-500"
                  style={{ width: `${stats.completionPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(
                ["mythic", "legendary", "very_rare", "rare", "normal"] as const
              ).map((rarity) => {
                const { count, max } = rarityCounts[rarity];
                const percent = max > 0 ? (count / max) * 100 : 0;

                return (
                  <div
                    key={rarity}
                    className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
                  >
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span
                        className={cn(
                          "font-medium px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                          RARITY_COLORS[rarity],
                        )}
                      >
                        {RARITY_LABELS[rarity]}
                      </span>
                      <span>
                        {count} / {max}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                          RARITY_COLORS[rarity],
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div
            variants={FADE_UP}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
          >
            <button
              onClick={() => setShowParticleShowcase(!showParticleShowcase)}
              className="w-full flex items-center justify-between text-xs font-medium text-white/70 hover:text-white transition-colors"
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

            <AnimatePresence initial={false}>
              {showParticleShowcase && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 mt-4">
                    {PARTICLE_SHOWCASE.map((effect) => (
                      <div key={effect.type} className="space-y-1">
                        <span className="text-[10px] text-white/50 uppercase tracking-wider">
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
                            density: 0.6,
                            speed: 1.2,
                            glow: true,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            variants={FADE_UP}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-300" />
                Discovered Mythic Moons ({discoveredMoons.length})
              </h4>
              <span className="text-xs text-white/60">
                Tap a moon to reveal its archive
              </span>
            </div>

            <div className="mt-4 space-y-3">
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
                    onToggleExpand={() =>
                      setExpandedMoon(isExpanded ? null : moon.id)
                    }
                    onToggleFavorite={() => toggleFavorite(moon.id)}
                    onToggleLock={() => toggleLock(moon.id)}
                    onAddBoost={(seconds) => addDurationBoost(moon.id, seconds)}
                    particles={particles}
                  />
                );
              })}
            </div>

            {discoveredMoons.length === 0 && (
              <div className="text-center py-10 text-white/60">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-70" />
                <p>No Mythic moons discovered yet</p>
                <p className="text-xs mt-1">
                  Keep exploring to find rare moon phenomena!
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={FADE_UP}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-md"
          >
            <button
              onClick={() => setShowUndiscovered(!showUndiscovered)}
              className="w-full flex items-center justify-between text-sm font-medium text-white"
            >
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-white/70" />
                Undiscovered ({undiscoveredMoons.length})
              </span>
              {showUndiscovered ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showUndiscovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {undiscoveredMoons.map((moon) => (
                      <div
                        key={moon.id}
                        className="p-3 rounded-2xl bg-black/30 border border-dashed border-white/15 flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4 text-white/50 flex-shrink-0" />
                        <span className="text-sm text-white/60 truncate">
                          ???
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
