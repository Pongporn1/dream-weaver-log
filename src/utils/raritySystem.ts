import {
  MoonRarity,
  MoonPhenomenon,
  getAllPhenomena,
} from "@/data/moonPhenomena";

// Rarity weights (adjusted for better user experience)
// Total: 120% (will be normalized by total weight calculation)
const RARITY_WEIGHTS: Record<MoonRarity, number> = {
  normal: 70, // 70% - ดวงจันทร์ 8 เฟส (ออกบ่อยที่สุด)
  rare: 20, // 20% - Supermoon, Earthshine (หายากพอประมาณ)
  very_rare: 15, // 15% - Blue Moon, Veiled Moon (หายากมาก)
  legendary: 10, // 10% - Blood Moon, Still Moon (หายากมากๆ)
  mythic: 5, // 5% - Empty Sky, Crystal Moon (หายากที่สุด)
};

/**
 * Select a random moon phenomenon based on rarity weights
 */
export const selectRandomPhenomenon = (): MoonPhenomenon => {
  const allPhenomena = getAllPhenomena();

  // Calculate total weight
  const totalWeight = allPhenomena.reduce((sum, phenomenon) => {
    return sum + RARITY_WEIGHTS[phenomenon.rarity];
  }, 0);

  // Generate random number
  let random = Math.random() * totalWeight;

  // Select phenomenon based on weight
  for (const phenomenon of allPhenomena) {
    random -= RARITY_WEIGHTS[phenomenon.rarity];
    if (random <= 0) {
      return phenomenon;
    }
  }

  // Fallback to first phenomenon (should never happen)
  return allPhenomena[0];
};

/**
 * Get or create session phenomenon
 * One phenomenon per session - stored in sessionStorage
 */
export const getSessionPhenomenon = (): MoonPhenomenon => {
  const STORAGE_KEY = "dreambook_moon_phenomenon";

  // Try to get existing phenomenon from sessionStorage
  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate that it's still a valid phenomenon
      if (parsed && parsed.id) {
        return parsed as MoonPhenomenon;
      }
    } catch (e) {
      console.error("Failed to parse stored phenomenon:", e);
    }
  }

  // No valid stored phenomenon - select a new one
  const newPhenomenon = selectRandomPhenomenon();

  // Store for this session
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newPhenomenon));

  return newPhenomenon;
};

/**
 * Clear session phenomenon (for testing/debugging)
 */
export const clearSessionPhenomenon = (): void => {
  sessionStorage.removeItem("dreambook_moon_phenomenon");
};

/**
 * Force set a specific phenomenon (for testing/debugging)
 */
export const setSessionPhenomenon = (phenomenon: MoonPhenomenon): void => {
  sessionStorage.setItem(
    "dreambook_moon_phenomenon",
    JSON.stringify(phenomenon),
  );
};
