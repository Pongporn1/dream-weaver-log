import type { MoonRarity } from "@/data/moonPhenomena";

interface UserBehavior {
  totalDreams: number;
  dreamFrequency: number; // dreams per week
  emotionCounts: {
    nightmare: number;
    peaceful: number;
    intense: number;
    mysterious: number;
  };
  lastDreamDate: string | null;
}

const STORAGE_KEY = "dreambook_user_behavior";

/**
 * Track user behavior for dynamic phenomenon probability
 */
export class UserBehaviorTracker {
  private behavior: UserBehavior;

  constructor() {
    this.behavior = this.loadBehavior();
  }

  private loadBehavior(): UserBehavior {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse user behavior:", e);
      }
    }

    return {
      totalDreams: 0,
      dreamFrequency: 0,
      emotionCounts: {
        nightmare: 0,
        peaceful: 0,
        intense: 0,
        mysterious: 0,
      },
      lastDreamDate: null,
    };
  }

  private saveBehavior() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.behavior));
  }

  /**
   * Record a new dream entry
   */
  recordDream(tags: string[]) {
    this.behavior.totalDreams++;
    this.behavior.lastDreamDate = new Date().toISOString();

    // Analyze tags for emotions
    tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag.includes("nightmare") || lowerTag.includes("scary")) {
        this.behavior.emotionCounts.nightmare++;
      }
      if (lowerTag.includes("peaceful") || lowerTag.includes("calm")) {
        this.behavior.emotionCounts.peaceful++;
      }
      if (lowerTag.includes("intense") || lowerTag.includes("vivid")) {
        this.behavior.emotionCounts.intense++;
      }
      if (lowerTag.includes("mysterious") || lowerTag.includes("strange")) {
        this.behavior.emotionCounts.mysterious++;
      }
    });

    // Calculate frequency
    this.calculateFrequency();
    this.saveBehavior();
  }

  private calculateFrequency() {
    if (!this.behavior.lastDreamDate || this.behavior.totalDreams < 2) {
      this.behavior.dreamFrequency = 0;
      return;
    }

    // Simple calculation: total dreams / weeks since first dream
    // This is a simplified version - you could make it more sophisticated
    const weeksActive = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(this.behavior.lastDreamDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    );
    this.behavior.dreamFrequency = this.behavior.totalDreams / weeksActive;
  }

  /**
   * Get adjusted rarity weights based on user behavior
   */
  getAdjustedWeights(): Record<MoonRarity, number> {
    const baseWeights: Record<MoonRarity, number> = {
      normal: 70,
      rare: 20,
      very_rare: 15,
      legendary: 10,
      mythic: 5,
    };

    // Boost rare phenomena for active users
    if (this.behavior.dreamFrequency > 3) {
      // More than 3 dreams per week
      baseWeights.rare += 5;
      baseWeights.very_rare += 3;
      baseWeights.legendary += 2;
    }

    if (this.behavior.totalDreams > 50) {
      // Veteran dreamers get more mythic chances
      baseWeights.mythic += 2;
      baseWeights.legendary += 3;
    }

    return baseWeights;
  }

  /**
   * Get phenomenon preference based on emotions
   */
  getEmotionPreference(): string | null {
    const { nightmare, peaceful, intense, mysterious } =
      this.behavior.emotionCounts;

    // Find dominant emotion
    const max = Math.max(nightmare, peaceful, intense, mysterious);
    if (max === 0) return null;

    if (nightmare === max) return "blood"; // Blood Moon for nightmares
    if (peaceful === max) return "stillMoon"; // Still Moon for peaceful
    if (intense === max) return "superBloodMoon"; // Super Blood Moon for intense
    if (mysterious === max) return "lunarTransientPhenomena"; // TLP for mysterious

    return null;
  }

  /**
   * Get current behavior stats
   */
  getStats(): UserBehavior {
    return { ...this.behavior };
  }

  /**
   * Reset behavior data (for testing)
   */
  reset() {
    this.behavior = {
      totalDreams: 0,
      dreamFrequency: 0,
      emotionCounts: {
        nightmare: 0,
        peaceful: 0,
        intense: 0,
        mysterious: 0,
      },
      lastDreamDate: null,
    };
    this.saveBehavior();
  }
}

// Export singleton instance
export const userBehaviorTracker = new UserBehaviorTracker();
