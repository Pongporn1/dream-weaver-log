import {
  MoonRarity,
  MoonPhenomenon,
  getAllPhenomena,
  MOON_PHENOMENA,
} from "@/data/moonPhenomena";
import { areMoonsUnlocked } from "@/lib/moonUnlock";

// Rarity weights (adjusted for better user experience)
const RARITY_WEIGHTS: Record<MoonRarity, number> = {
  normal: 70, // 70% - ดวงจันทร์ 8 เฟส (ออกบ่อยที่สุด)
  rare: 20, // 20% - Supermoon, Earthshine (หายากพอประมาณ)
  very_rare: 15, // 15% - Blue Moon, Veiled Moon (หายากมาก)
  legendary: 10, // 10% - Blood Moon, Still Moon (หายากมากๆ)
  mythic: 5, // 5% - Empty Sky, Crystal Moon (หายากที่สุด)
};

// Unlocked mode: All moons have equal chance
const UNLOCKED_WEIGHTS: Record<MoonRarity, number> = {
  normal: 30,
  rare: 30,
  very_rare: 30,
  legendary: 30,
  mythic: 30,
};

// Storage keys
const STORAGE_KEY = "dreambook_moon_phenomenon";
const EXPIRY_KEY = "dreambook_moon_expiry";
const BOOST_COLLECTION_KEY = "mythic-moon-collection";
const LOCKED_MOON_KEY = "mythic-locked-moon";
const MYTHIC_SHUFFLE_KEY = "mythic-shuffle-enabled";

// Base duration before re-rolling (in milliseconds)
const BASE_DURATION_MS = 30 * 60 * 1000; // 30 minutes base

/**
 * Select a random moon phenomenon based on rarity weights
 * If moons are unlocked, all moons have equal chance
 */
export const selectRandomPhenomenon = (): MoonPhenomenon => {
  const allPhenomena = getAllPhenomena();
  const isUnlocked = areMoonsUnlocked();
  const weights = isUnlocked ? UNLOCKED_WEIGHTS : RARITY_WEIGHTS;

  // Calculate total weight
  const totalWeight = allPhenomena.reduce((sum, phenomenon) => {
    return sum + weights[phenomenon.rarity];
  }, 0);

  // Generate random number
  let random = Math.random() * totalWeight;

  // Select phenomenon based on weight
  for (const phenomenon of allPhenomena) {
    random -= weights[phenomenon.rarity];
    if (random <= 0) {
      return phenomenon;
    }
  }

  // Fallback to first phenomenon (should never happen)
  return allPhenomena[0];
};

/**
 * Get duration boost for a specific moon from collection
 */
const getDurationBoost = (moonId: string): number => {
  try {
    const stored = localStorage.getItem(BOOST_COLLECTION_KEY);
    if (stored) {
      const collection = JSON.parse(stored);
      return collection[moonId]?.themeDurationBoost || 0;
    }
  } catch (e) {
    console.error("Failed to get duration boost:", e);
  }
  return 0;
};

const getDiscoveredMythicPhenomena = (): MoonPhenomenon[] => {
  const allMythics = Object.values(MOON_PHENOMENA).filter(
    (moon) => moon.rarity === "mythic",
  );
  try {
    const stored = localStorage.getItem(BOOST_COLLECTION_KEY);
    if (!stored) {
      return areMoonsUnlocked() ? allMythics : [];
    }
    const collection = JSON.parse(stored) as Record<string, unknown>;

    const discovered = allMythics.filter((moon) => !!collection[moon.id]);
    if (discovered.length === 0 && areMoonsUnlocked()) {
      return allMythics;
    }
    return discovered;
  } catch (e) {
    console.error("Failed to read mythic collection:", e);
    return [];
  }
};

const selectRandomFromList = (
  list: MoonPhenomenon[],
  excludeId?: string,
): MoonPhenomenon | null => {
  if (list.length === 0) return null;
  if (excludeId && list.length > 1) {
    const filtered = list.filter((moon) => moon.id !== excludeId);
    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
  }
  return list[Math.floor(Math.random() * list.length)];
};

export const isMythicShuffleEnabled = (): boolean => {
  try {
    return localStorage.getItem(MYTHIC_SHUFFLE_KEY) === "1";
  } catch (e) {
    console.error("Failed to read mythic shuffle state:", e);
    return false;
  }
};

export const setMythicShuffleEnabled = (enabled: boolean): void => {
  try {
    if (enabled) {
      localStorage.setItem(MYTHIC_SHUFFLE_KEY, "1");
    } else {
      localStorage.removeItem(MYTHIC_SHUFFLE_KEY);
    }
  } catch (e) {
    console.error("Failed to set mythic shuffle state:", e);
  }
};

/**
 * Calculate total duration for a phenomenon (base + boost)
 */
const calculateTotalDuration = (phenomenon: MoonPhenomenon): number => {
  const boost = getDurationBoost(phenomenon.id);
  const boostMs = boost * 1000; // Convert seconds to milliseconds
  return BASE_DURATION_MS + boostMs;
};

/**
 * Get locked moon phenomenon if any
 */
const getLockedMoon = (): MoonPhenomenon | null => {
  const lockedId = localStorage.getItem(LOCKED_MOON_KEY);
  if (lockedId && MOON_PHENOMENA[lockedId]) {
    return MOON_PHENOMENA[lockedId];
  }
  return null;
};

/**
 * Get or create session phenomenon
 * Stored in localStorage with expiry based on duration boost
 * If a moon is locked, always return that moon
 * Returns { phenomenon, isNewEncounter } to track if this is a new encounter
 */
export const getSessionPhenomenon = (): {
  phenomenon: MoonPhenomenon;
  isNewEncounter: boolean;
} => {
  const shuffleEnabled = isMythicShuffleEnabled();
  const discoveredMythics = shuffleEnabled ? getDiscoveredMythicPhenomena() : [];
  const shouldShuffleMythic =
    shuffleEnabled && discoveredMythics.length > 0;

  // First, check if there's a locked moon
  const lockedMoon = getLockedMoon();
  if (lockedMoon) {
    console.log(`🔒 Using locked moon: ${lockedMoon.name}`);
    // Store it as current phenomenon (no expiry needed for locked moons)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lockedMoon));
    localStorage.removeItem(EXPIRY_KEY); // No expiry for locked moons
    return { phenomenon: lockedMoon, isNewEncounter: false }; // Locked moon doesn't count as new encounter
  }

  const now = Date.now();

  // Try to get existing phenomenon from localStorage
  const storedPhenomenon = localStorage.getItem(STORAGE_KEY);
  const storedExpiry = localStorage.getItem(EXPIRY_KEY);
  let previousPhenomenonId: string | undefined;

  if (storedPhenomenon && storedExpiry) {
    try {
      const parsed = JSON.parse(storedPhenomenon);
      const expiryTime = parseInt(storedExpiry, 10);
      previousPhenomenonId = parsed?.id;

      // Check if still valid (not expired)
      if (parsed && parsed.id && now < expiryTime) {
        if (shouldShuffleMythic) {
          const isMythic = parsed.rarity === "mythic";
          const isDiscovered = discoveredMythics.some(
            (moon) => moon.id === parsed.id,
          );
          if (isMythic && isDiscovered) {
            const remainingMs = expiryTime - now;
            const remainingMins = Math.round(remainingMs / 60000);
            console.log(
              `🌙 Mythic shuffle valid for ${remainingMins} more minutes`,
            );
            return {
              phenomenon: parsed as MoonPhenomenon,
              isNewEncounter: false,
            };
          }
        } else {
          const remainingMs = expiryTime - now;
          const remainingMins = Math.round(remainingMs / 60000);
          console.log(`🌙 Moon theme valid for ${remainingMins} more minutes`);
          return {
            phenomenon: parsed as MoonPhenomenon,
            isNewEncounter: false,
          }; // Existing moon
        }
      }

      // Expired - log it
      if (now >= expiryTime) {
        console.log("🌙 Moon theme expired, selecting new one...");
      }
    } catch (e) {
      console.error("Failed to parse stored phenomenon:", e);
    }
  }

  // No valid stored phenomenon - select a new one
  const newPhenomenon = shouldShuffleMythic
    ? selectRandomFromList(discoveredMythics, previousPhenomenonId) ||
      selectRandomPhenomenon()
    : selectRandomPhenomenon();

  // Calculate expiry based on boost
  const duration = calculateTotalDuration(newPhenomenon);
  const expiryTime = now + duration;

  // Store for persistence
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newPhenomenon));
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());

  const durationMins = Math.round(duration / 60000);
  const unlockStatus = areMoonsUnlocked() ? " 🔓 [UNLOCKED MODE]" : "";
  console.log(
    `🌙 New moon selected: ${newPhenomenon.name} (duration: ${durationMins} minutes)${unlockStatus}`,
  );

  return { phenomenon: newPhenomenon, isNewEncounter: true }; // This is a new encounter!
};

/**
 * Extend current phenomenon duration by adding boost
 */
export const extendPhenomenonDuration = (additionalSeconds: number): void => {
  const storedExpiry = localStorage.getItem(EXPIRY_KEY);
  if (storedExpiry) {
    const currentExpiry = parseInt(storedExpiry, 10);
    const newExpiry = currentExpiry + additionalSeconds * 1000;
    localStorage.setItem(EXPIRY_KEY, newExpiry.toString());
    console.log(`🌙 Extended duration by ${additionalSeconds}s`);
  }
};

/**
 * Get remaining time for current phenomenon (in seconds)
 */
export const getRemainingTime = (): number => {
  const storedExpiry = localStorage.getItem(EXPIRY_KEY);
  if (storedExpiry) {
    const expiryTime = parseInt(storedExpiry, 10);
    const remaining = Math.max(0, expiryTime - Date.now());
    return Math.floor(remaining / 1000);
  }
  return 0;
};

/**
 * Clear session phenomenon (for testing/debugging or force refresh)
 */
export const clearSessionPhenomenon = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  console.log("🌙 Moon phenomenon cleared");
};

/**
 * Force set a specific phenomenon (for testing/debugging)
 */
export const setSessionPhenomenon = (phenomenon: MoonPhenomenon): void => {
  const duration = calculateTotalDuration(phenomenon);
  const expiryTime = Date.now() + duration;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(phenomenon));
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());

  const durationMins = Math.round(duration / 60000);
  console.log(
    `🌙 Force set: ${phenomenon.name} (duration: ${durationMins} minutes)`,
  );
};

/**
 * Refresh phenomenon with new duration (when boost is added)
 */
export const refreshPhenomenonWithBoost = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const phenomenon = JSON.parse(stored) as MoonPhenomenon;
      const duration = calculateTotalDuration(phenomenon);
      const expiryTime = Date.now() + duration;
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString());

      const durationMins = Math.round(duration / 60000);
      console.log(
        `🌙 Refreshed: ${phenomenon.name} with new duration: ${durationMins} minutes`,
      );
    } catch (e) {
      console.error("Failed to refresh phenomenon:", e);
    }
  }
};
