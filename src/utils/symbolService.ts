/**
 * Symbol Service - Helper functions for symbol management
 * Provides easy access to symbol generation and analysis
 */

import type { SymbolType, SymbolRotation } from "@/hooks/useCoverStyle";
import type { DreamLog } from "@/types/dream";
import {
  generateSymbolFromAI,
  calculateSymbolFromAnalysis,
  getSymbolAnimationProfile,
} from "./symbolGenerator";

export interface AIAnalysisResult {
  themes: string[];
  sentiment: "positive" | "neutral" | "negative";
  rarity: number;
  keywords: string[];
}

/**
 * Generate symbol from a complete dream log
 * This is the main entry point for symbol generation
 */
export function getSymbolForDream(
  dream: DreamLog,
  aiAnalysis?: AIAnalysisResult,
) {
  if (aiAnalysis) {
    // Use AI analysis if available
    return calculateSymbolFromAnalysis(
      dream.world,
      aiAnalysis.themes,
      aiAnalysis.sentiment,
      aiAnalysis.rarity,
    );
  }

  // Fall back to content-based generation
  return generateSymbolFromAI(
    dream.world,
    dream.environments,
    dream.entities,
    dream.threatLevel,
    dream.notes,
  );
}

/**
 * Batch generate symbols for multiple dreams
 * Useful for library/gallery views
 */
export function generateSymbolsForDreams(
  dreams: DreamLog[],
  analysisMap?: Record<string, AIAnalysisResult>,
) {
  return dreams.map((dream) => ({
    dreamId: dream.id,
    symbol: getSymbolForDream(dream, analysisMap?.[dream.id]),
  }));
}

/**
 * Get all animation details for a symbol
 * Useful for debugging or animation preview
 */
export function getSymbolDetails(
  dream: DreamLog,
  aiAnalysis?: AIAnalysisResult,
) {
  const symbol = getSymbolForDream(dream, aiAnalysis);
  const animation = getSymbolAnimationProfile(symbol.type);

  return {
    ...symbol,
    animation,
    description: `${symbol.type} symbol with complexity ${symbol.complexity} at ${animation.duration} ${animation.intensity} animation`,
  };
}

/**
 * Convert threat level to rotation for consistency
 */
export function threatToRotation(threatLevel: number): SymbolRotation {
  if (threatLevel >= 5) return "pulse";
  if (threatLevel >= 3) return "medium";
  if (threatLevel >= 1) return "slow";
  return "none";
}

/**
 * Convert entity count to complexity
 */
export function entityCountToComplexity(count: number): number {
  return Math.min(5, Math.max(1, Math.ceil(count / 2)));
}

/**
 * Get recommended color for symbol based on threat level
 */
export function getThreatColor(threatLevel: number): string {
  const colors: Record<number, string> = {
    0: "#10b981", // Green - Safe
    1: "#8b5cf6", // Purple - Minor
    2: "#f59e0b", // Amber - Moderate
    3: "#f97316", // Orange - Significant
    4: "#ef4444", // Red - High
    5: "#dc2626", // Dark Red - Critical
  };
  return colors[threatLevel] || "#9ca3af"; // Gray fallback
}

/**
 * Export symbol properties as JSON for API or database storage
 */
export function serializeSymbolConfig(
  symbol: ReturnType<typeof getSymbolForDream>,
) {
  return JSON.stringify({
    type: symbol.type,
    complexity: symbol.complexity,
    rotation: symbol.rotation,
  });
}

/**
 * Parse symbol properties from JSON
 */
export function deserializeSymbolConfig(json: string) {
  try {
    const parsed = JSON.parse(json);
    return {
      type: parsed.type as SymbolType,
      complexity: parsed.complexity as number,
      rotation: parsed.rotation as SymbolRotation,
    };
  } catch {
    // Return default if parsing fails
    return {
      type: "moon" as SymbolType,
      complexity: 3,
      rotation: "slow" as SymbolRotation,
    };
  }
}
