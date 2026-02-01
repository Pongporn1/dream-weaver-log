/**
 * Symbol Generator - Creates unique Mystic Symbols based on dream AI analysis
 * Maps dream characteristics to unique symbol properties
 */

import type { SymbolType, SymbolRotation } from "@/hooks/useCoverStyle";

export interface SymbolConfig {
  type: SymbolType;
  complexity: number;
  rotation: SymbolRotation;
}

/**
 * Generate a unique symbol configuration based on dream content
 * @param world - Dream world name
 * @param environments - Dream environments
 * @param entities - Dream entities
 * @param threatLevel - Dream threat level (0-5)
 * @param notes - Dream notes/description
 * @returns SymbolConfig for rendering
 */
export function generateSymbolFromAI(
  world: string,
  environments: string[] = [],
  entities: string[] = [],
  threatLevel: number = 0,
  notes: string = "",
): SymbolConfig {
  // Combine all content for analysis
  const content =
    `${world} ${environments.join(" ")} ${entities.join(" ")} ${notes}`.toLowerCase();

  console.log(`[SymbolGenerator] Generating symbol for: "${world}"`);
  console.log(`[SymbolGenerator] Environments: [${environments.join(", ")}]`);
  console.log(`[SymbolGenerator] Entities: [${entities.join(", ")}]`);
  console.log(`[SymbolGenerator] Threat: ${threatLevel}`);

  // Map threat level to rotation speed
  const rotationMap: Record<number, SymbolRotation> = {
    0: "none", // Safe - no rotation
    1: "slow", // Minor threat - slow rotation
    2: "slow", // Moderate - slow rotation
    3: "medium", // Significant - medium rotation
    4: "medium", // High threat - medium rotation
    5: "pulse", // Critical - pulse for alert
  };

  // Determine complexity from entity count and threat level
  const complexity = Math.min(
    5,
    Math.max(1, Math.ceil((entities.length + threatLevel) / 2)),
  );

  // Symbol type mapping based on keywords in dream content
  const symbolType = determineSymbolType(content, environments, threatLevel);

  console.log(
    `[SymbolGenerator] Result: type=${symbolType}, complexity=${complexity}, rotation=${rotationMap[threatLevel]}`,
  );

  return {
    type: symbolType,
    complexity,
    rotation: rotationMap[threatLevel] || "slow",
  };
}

/**
 * Determine symbol type based on dream characteristics
 */
function determineSymbolType(
  content: string,
  environments: string[] = [],
  threatLevel: number,
): SymbolType {
  // Keywords for each symbol type
  const symbolKeywords: Record<SymbolType, string[]> = {
    moon: [
      "night",
      "sleep",
      "dream",
      "rest",
      "peaceful",
      "calm",
      "lunar",
      "pale",
      "นอน",
      "หลับ",
    ],
    void: [
      "empty",
      "fog",
      "nothing",
      "void",
      "darkness",
      "lost",
      "forgotten",
      "หมอก",
      "ว่างเปล่า",
    ],
    spiral: [
      "sea",
      "water",
      "spiral",
      "journey",
      "infinite",
      "flow",
      "tide",
      "ทะเล",
      "น้ำ",
    ],
    eye: [
      "watch",
      "see",
      "observe",
      "witness",
      "eye",
      "sight",
      "vision",
      "มอง",
      "ตา",
    ],
    flame: [
      "fire",
      "hot",
      "danger",
      "power",
      "energy",
      "explosion",
      "sunset",
      "ไฟ",
      "ร้อน",
    ],
    heart: [
      "love",
      "emotion",
      "feeling",
      "care",
      "compassion",
      "heart",
      "รัก",
      "หัวใจ",
    ],
    lotus: [
      "rain",
      "peace",
      "awakening",
      "growth",
      "flower",
      "rebirth",
      "nature",
      "ฝน",
      "ดอกไม้",
    ],
    tree: [
      "mountain",
      "growth",
      "tree",
      "nature",
      "forest",
      "standing",
      "roots",
      "ภูเขา",
      "ต้นไม้",
      "ป่า",
    ],
    gate: [
      "city",
      "tunnel",
      "passage",
      "door",
      "entrance",
      "transition",
      "เมือง",
      "ประตู",
      "ทาง",
    ],
    crown: [
      "power",
      "victory",
      "authority",
      "leader",
      "royal",
      "highest",
      "อำนาจ",
      "ชันะ",
    ],
    key: [
      "secret",
      "unlock",
      "mystery",
      "hidden",
      "locked",
      "discover",
      "ลึกลับ",
      "ลับ",
    ],
    skull: [
      "death",
      "danger",
      "threat",
      "evil",
      "hostile",
      "monster",
      "enemy",
      "intruder",
      "อันตราย",
      "ศัตรู",
    ],
    hourglass: [
      "time",
      "urgency",
      "countdown",
      "deadline",
      "sand",
      "เวลา",
      "รีบ",
    ],
    compass: [
      "direction",
      "journey",
      "travel",
      "navigation",
      "path",
      "ทาง",
      "เดินทาง",
      "ทิศ",
    ],
    infinity: [
      "eternal",
      "infinite",
      "forever",
      "endless",
      "cycle",
      "นิรันดร",
      "ไม่สิ้นสุด",
    ],
  };

  // Environment-based symbol mapping (primary check)
  const envSymbolMap: Record<string, SymbolType> = {
    fog: "void",
    sea: "spiral",
    mountain: "tree",
    city: "gate",
    tunnel: "gate",
    rain: "lotus",
    night: "moon",
    sunset: "flame",
  };

  // First, check environments for direct mapping
  if (environments.length > 0) {
    for (const env of environments) {
      if (envSymbolMap[env]) {
        console.log(
          `[SymbolGenerator] Matched environment "${env}" → ${envSymbolMap[env]}`,
        );
        return envSymbolMap[env];
      }
    }
  }

  // Then check for keyword matches in content
  for (const [symbol, keywords] of Object.entries(symbolKeywords)) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      console.log(`[SymbolGenerator] Matched keyword in content → ${symbol}`);
      return symbol as SymbolType;
    }
  }

  // If threat level is high and no match found, use skull
  if (threatLevel >= 4) {
    console.log(`[SymbolGenerator] High threat level (${threatLevel}) → skull`);
    return "skull";
  }

  // Default to moon for general dreams
  console.log(`[SymbolGenerator] No match found, using default → moon`);
  return "moon";
}

/**
 * Calculate symbol properties from dream analysis results
 * This should be called with AI-generated dream analysis
 */
export function calculateSymbolFromAnalysis(
  worldName: string,
  themes: string[] = [],
  sentiment: "positive" | "neutral" | "negative" = "neutral",
  rarity: number = 0.5,
): SymbolConfig {
  // Map sentiment to complexity
  const sentimentComplexityMap = {
    positive: 2,
    neutral: 3,
    negative: 4,
  };

  // Rarity affects complexity (0-1 scale)
  const rarityBonus = Math.floor(rarity * 2);
  const complexity = Math.min(
    5,
    sentimentComplexityMap[sentiment] + rarityBonus,
  );

  // Map sentiment to rotation
  const rotationMap = {
    positive: "slow" as SymbolRotation,
    neutral: "medium" as SymbolRotation,
    negative: "pulse" as SymbolRotation,
  };

  // Determine symbol from themes
  const allThemes = [worldName, ...themes].join(" ").toLowerCase();
  const symbolType = determineSymbolType(allThemes, [], 0);

  return {
    type: symbolType,
    complexity,
    rotation: rotationMap[sentiment],
  };
}

/**
 * Get animation characteristics for a symbol
 */
export function getSymbolAnimationProfile(symbolType: SymbolType): {
  duration: string;
  intensity: "subtle" | "moderate" | "intense";
  style: string;
} {
  const profiles: Record<
    SymbolType,
    {
      duration: string;
      intensity: "subtle" | "moderate" | "intense";
      style: string;
    }
  > = {
    moon: {
      duration: "6s",
      intensity: "subtle",
      style: "floating and serene",
    },
    void: {
      duration: "4s",
      intensity: "moderate",
      style: "pulsing emptiness",
    },
    spiral: {
      duration: "20s",
      intensity: "moderate",
      style: "constant rotation",
    },
    eye: {
      duration: "3s",
      intensity: "intense",
      style: "blinking observation",
    },
    flame: {
      duration: "2s",
      intensity: "intense",
      style: "flickering fire",
    },
    heart: {
      duration: "1.5s",
      intensity: "intense",
      style: "rhythmic heartbeat",
    },
    lotus: {
      duration: "4s",
      intensity: "subtle",
      style: "gentle swaying",
    },
    tree: {
      duration: "5s",
      intensity: "subtle",
      style: "growing and breathing",
    },
    gate: {
      duration: "3s",
      intensity: "moderate",
      style: "waving passage",
    },
    crown: {
      duration: "4s",
      intensity: "moderate",
      style: "graceful bobbing",
    },
    key: {
      duration: "2s",
      intensity: "subtle",
      style: "subtle glow",
    },
    skull: {
      duration: "1.5s",
      intensity: "intense",
      style: "danger pulse",
    },
    hourglass: {
      duration: "3s",
      intensity: "moderate",
      style: "sand falling",
    },
    compass: {
      duration: "8s",
      intensity: "subtle",
      style: "steady rotation",
    },
    infinity: {
      duration: "12s",
      intensity: "subtle",
      style: "eternal flow",
    },
  };

  return (
    profiles[symbolType] || {
      duration: "4s",
      intensity: "moderate",
      style: "gentle animation",
    }
  );
}
