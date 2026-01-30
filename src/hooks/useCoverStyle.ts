import { useState, useEffect } from "react";
import { DreamLog } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";

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
  symbolEmoji: string;
  keywords: string[];
}

// In-memory cache for cover styles
const styleCache = new Map<string, AICoverStyle>();

export function useCoverStyle(dream: DreamLog) {
  const [style, setStyle] = useState<AICoverStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only analyze if there are notes to analyze
    if (!dream.notes || dream.notes.trim().length < 10) {
      setStyle(null);
      return;
    }

    // Check cache first
    const cacheKey = `${dream.id}-${dream.notes?.slice(0, 50)}`;
    if (styleCache.has(cacheKey)) {
      setStyle(styleCache.get(cacheKey)!);
      return;
    }

    const fetchStyle = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("analyze-cover", {
          body: {
            notes: dream.notes,
            world: dream.world,
            environments: dream.environments,
            threatLevel: dream.threatLevel,
            entities: dream.entities,
          },
        });

        if (fnError) {
          throw fnError;
        }

        if (data && !data.error) {
          styleCache.set(cacheKey, data);
          setStyle(data);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (e) {
        console.error("Failed to fetch cover style:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStyle();
  }, [dream.id, dream.notes, dream.world, dream.environments, dream.threatLevel, dream.entities]);

  return { style, loading, error };
}
