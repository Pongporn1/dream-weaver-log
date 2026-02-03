import { useState, useEffect } from "react";
import { DreamLog } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";

export type SymbolType = "eye" | "moon" | "tree" | "gate" | "spiral" | "flame" | "void" | "crown" | "key" | "heart" | "skull" | "hourglass" | "compass" | "infinity" | "lotus";
export type SymbolRotation = "none" | "slow" | "medium" | "pulse";

export interface AICoverStyle {
  mood: string;
  primaryHue: number;
  secondaryHue: number;
  accentHue: number;
  saturation: number;
  brightness: "dim" | "normal" | "bright" | "glowing";
  pattern: "waves" | "circles" | "stars" | "lines" | "dots" | "crystals" | "smoke" | "spiral";
  particleStyle: "floating" | "falling" | "rising" | "orbiting" | "scattered" | "pulsing";
  gradientAngle: number;
  symbolType: SymbolType;
  symbolComplexity: number;
  symbolRotation: SymbolRotation;
  keywords: string[];
}

// In-memory cache for cover styles
const styleCache = new Map<string, AICoverStyle>();

export function useCoverStyle(dream: DreamLog) {
  const [style, setStyle] = useState<AICoverStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // AI API is disabled due to payment/quota exhaustion
    // Always return null to use fallback styling
    setStyle(null);
    setLoading(false);
    return;
  }, [dream.id, dream.notes, dream.world, dream.environments, dream.threatLevel, dream.entities]);

  return { style, loading, error };
}
