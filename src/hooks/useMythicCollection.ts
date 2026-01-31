import { useState, useEffect, useCallback } from "react";
import type { MoonPhenomenon, MoonRarity } from "@/data/moonPhenomena";
import { MOON_PHENOMENA } from "@/data/moonPhenomena";

// Collection entry for a discovered moon
export interface MoonCollectionEntry {
  id: string;
  firstEncountered: string; // ISO date
  encounterCount: number;
  lastEncountered: string; // ISO date
  isFavorite: boolean;
  isLocked: boolean; // Lock moon permanently (no random re-roll)
  themeDurationBoost: number; // seconds of bonus time (0-86400)
}

// Collection stats
export interface CollectionStats {
  totalDiscovered: number;
  totalEncounters: number;
  mythicCount: number;
  legendaryCount: number;
  veryRareCount: number;
  rareCount: number;
  normalCount: number;
  completionPercent: number;
}

// Particle config for each Mythic moon
export interface MythicParticleConfig {
  type:
    | "stars"
    | "fire"
    | "snow"
    | "crystals"
    | "void"
    | "blood"
    | "aurora"
    | "lightning";
  color: string;
  secondaryColor?: string;
  speed: number;
  density: number;
  glow: boolean;
}

const STORAGE_KEY = "mythic-moon-collection";
const LOCKED_MOON_KEY = "mythic-locked-moon";

// Particle configs for each Mythic moon
export const MYTHIC_PARTICLE_CONFIGS: Record<string, MythicParticleConfig> = {
  superBloodMoon: {
    type: "blood",
    color: "#DC143C",
    secondaryColor: "#8B0000",
    speed: 1.5,
    density: 0.8,
    glow: true,
  },
  superBlueBloodMoon: {
    type: "aurora",
    color: "#B840A0",
    secondaryColor: "#4040B8",
    speed: 1.2,
    density: 0.7,
    glow: true,
  },
  lunarTransientPhenomena: {
    type: "lightning",
    color: "#C8A8F8",
    secondaryColor: "#FFFFFF",
    speed: 2.5,
    density: 0.5,
    glow: true,
  },
  hybridEclipse: {
    type: "fire",
    color: "#FFB870",
    secondaryColor: "#D8A860",
    speed: 1.0,
    density: 0.6,
    glow: true,
  },
  stillMoon: {
    type: "crystals",
    color: "#B0C4DE",
    secondaryColor: "#E0F0FF",
    speed: 0.3,
    density: 0.4,
    glow: false,
  },
  echoMoon: {
    type: "stars",
    color: "#D0D0E8",
    secondaryColor: "#9090B8",
    speed: 0.8,
    density: 0.6,
    glow: false,
  },
  brokenMoon: {
    type: "void",
    color: "#9898B8",
    secondaryColor: "#484868",
    speed: 1.8,
    density: 0.9,
    glow: false,
  },
  emptySky: {
    type: "void",
    color: "#404040",
    secondaryColor: "#202020",
    speed: 0.5,
    density: 0.2,
    glow: false,
  },
  crystalMoon: {
    type: "crystals",
    color: "#E0F0FF",
    secondaryColor: "#80C0FF",
    speed: 0.6,
    density: 0.7,
    glow: true,
  },
  arcticMoon: {
    type: "snow",
    color: "#90DCC8",
    secondaryColor: "#FFFFFF",
    speed: 0.7,
    density: 0.8,
    glow: false,
  },
  shatteredMoon: {
    type: "void",
    color: "#9898C8",
    secondaryColor: "#6060A0",
    speed: 2.0,
    density: 0.7,
    glow: true,
  },
  cosmicVoyageMoon: {
    type: "stars",
    color: "#8090C0",
    secondaryColor: "#4060A0",
    speed: 1.0,
    density: 0.9,
    glow: true,
  },
  nebulaDreamMoon: {
    type: "aurora",
    color: "#B888D8",
    secondaryColor: "#D060A0",
    speed: 0.9,
    density: 0.6,
    glow: true,
  },
};

export function useMythicCollection() {
  const [collection, setCollection] = useState<
    Record<string, MoonCollectionEntry>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        setCollection(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse moon collection:", e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    }
  }, [collection, isLoaded]);

  // Record an encounter with a moon
  const recordEncounter = useCallback((phenomenon: MoonPhenomenon) => {
    const now = new Date().toISOString();

    setCollection((prev) => {
      const existing = prev[phenomenon.id];

      if (existing) {
        return {
          ...prev,
          [phenomenon.id]: {
            ...existing,
            encounterCount: existing.encounterCount + 1,
            lastEncountered: now,
          },
        };
      }

      return {
        ...prev,
        [phenomenon.id]: {
          id: phenomenon.id,
          firstEncountered: now,
          encounterCount: 1,
          lastEncountered: now,
          isFavorite: false,
          isLocked: false,
          themeDurationBoost: 0,
        },
      };
    });
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((moonId: string) => {
    setCollection((prev) => {
      const existing = prev[moonId];
      if (!existing) return prev;

      return {
        ...prev,
        [moonId]: {
          ...existing,
          isFavorite: !existing.isFavorite,
        },
      };
    });
  }, []);

  // Toggle lock status - permanently lock a moon theme
  const toggleLock = useCallback((moonId: string) => {
    setCollection((prev) => {
      const existing = prev[moonId];
      if (!existing) return prev;

      // Require 5+ encounters to unlock the lock feature
      if (existing.encounterCount < 5 && !existing.isLocked) {
        console.log(
          `🔒 Need ${5 - existing.encounterCount} more encounters to unlock Lock Theme feature`,
        );
        return prev;
      }

      const newIsLocked = !existing.isLocked;

      // Update localStorage for locked moon
      if (newIsLocked) {
        localStorage.setItem(LOCKED_MOON_KEY, moonId);
        console.log(`🔒 Moon locked: ${moonId}`);
      } else {
        localStorage.removeItem(LOCKED_MOON_KEY);
        console.log(`🔓 Moon unlocked: ${moonId}`);
      }

      // Unlock any other moons (only one can be locked at a time)
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (id !== moonId && updated[id].isLocked) {
          updated[id] = { ...updated[id], isLocked: false };
        }
      });

      return {
        ...updated,
        [moonId]: {
          ...existing,
          isLocked: newIsLocked,
        },
      };
    });
  }, []);

  // Get currently locked moon ID
  const getLockedMoonId = useCallback((): string | null => {
    return localStorage.getItem(LOCKED_MOON_KEY);
  }, []);

  // Add duration boost to a moon (max 86400 seconds / 1 day)
  const addDurationBoost = useCallback((moonId: string, seconds: number) => {
    setCollection((prev) => {
      const existing = prev[moonId];
      if (!existing) return prev;

      return {
        ...prev,
        [moonId]: {
          ...existing,
          themeDurationBoost: Math.min(
            86400,
            existing.themeDurationBoost + seconds,
          ),
        },
      };
    });
  }, []);

  // Get effective theme duration (base + boost)
  const getEffectiveThemeDuration = useCallback(
    (phenomenon: MoonPhenomenon): number => {
      const baseDuration = phenomenon.transitionSpeed * 2; // Double the transition as base
      const entry = collection[phenomenon.id];
      const boost = entry?.themeDurationBoost || 0;
      return baseDuration + boost;
    },
    [collection],
  );

  // Calculate collection stats
  const getStats = useCallback((): CollectionStats => {
    const allMoons = Object.keys(MOON_PHENOMENA);
    const discovered = Object.keys(collection);

    const countByRarity = (rarity: MoonRarity) =>
      discovered.filter((id) => MOON_PHENOMENA[id]?.rarity === rarity).length;

    const totalEncounters = Object.values(collection).reduce(
      (sum, entry) => sum + entry.encounterCount,
      0,
    );

    return {
      totalDiscovered: discovered.length,
      totalEncounters,
      mythicCount: countByRarity("mythic"),
      legendaryCount: countByRarity("legendary"),
      veryRareCount: countByRarity("very_rare"),
      rareCount: countByRarity("rare"),
      normalCount: countByRarity("normal"),
      completionPercent: Math.round(
        (discovered.length / allMoons.length) * 100,
      ),
    };
  }, [collection]);

  // Get all mythic moons with discovery status
  const getMythicMoons = useCallback(() => {
    return Object.values(MOON_PHENOMENA)
      .filter((moon) => moon.rarity === "mythic")
      .map((moon) => ({
        ...moon,
        discovered: !!collection[moon.id],
        entry: collection[moon.id] || null,
        particles: MYTHIC_PARTICLE_CONFIGS[moon.id] || null,
      }));
  }, [collection]);

  // Get particle config for a moon
  const getParticleConfig = useCallback(
    (moonId: string): MythicParticleConfig | null => {
      return MYTHIC_PARTICLE_CONFIGS[moonId] || null;
    },
    [],
  );

  // Check if moon is discovered
  const isDiscovered = useCallback(
    (moonId: string): boolean => {
      return !!collection[moonId];
    },
    [collection],
  );

  return {
    collection,
    isLoaded,
    recordEncounter,
    toggleFavorite,
    toggleLock,
    getLockedMoonId,
    addDurationBoost,
    getEffectiveThemeDuration,
    getStats,
    getMythicMoons,
    getParticleConfig,
    isDiscovered,
  };
}
