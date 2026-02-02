import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamLog } from "@/types/dream";

// In-memory cache for symbol URLs
const symbolCache = new Map<string, string>();

export interface UseSymbolImageResult {
  symbolUrl: string | null;
  loading: boolean;
  error: string | null;
}

export function useSymbolImage(dream: DreamLog, mood?: string | null): UseSymbolImageResult {
  const [symbolUrl, setSymbolUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only generate if there are notes to analyze
    if (!dream.notes || dream.notes.trim().length < 10) {
      setSymbolUrl(null);
      return;
    }

    // Check cache first
    const cacheKey = dream.id;
    if (symbolCache.has(cacheKey)) {
      setSymbolUrl(symbolCache.get(cacheKey)!);
      return;
    }

    // Check storage directly first (faster than calling edge function)
    const checkExistingSymbol = async () => {
      const { data: { publicUrl } } = supabase.storage
        .from("dream-symbols")
        .getPublicUrl(`${dream.id}.png`);

      // Try to fetch to see if it exists
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        if (response.ok) {
          symbolCache.set(cacheKey, publicUrl);
          setSymbolUrl(publicUrl);
          return true;
        }
      } catch {
        // Symbol doesn't exist, continue to generate
      }
      return false;
    };

    const generateSymbol = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if already exists
        const exists = await checkExistingSymbol();
        if (exists) {
          setLoading(false);
          return;
        }

        // Generate new cover
        const { data, error: fnError } = await supabase.functions.invoke("generate-symbol", {
          body: {
            dreamId: dream.id,
            notes: dream.notes,
            world: dream.world,
            environments: dream.environments,
            threatLevel: dream.threatLevel,
            mood: mood,
            entities: dream.entities,
          },
        });

        if (fnError) {
          throw fnError;
        }

        if (data && !data.error && data.symbolUrl) {
          symbolCache.set(cacheKey, data.symbolUrl);
          setSymbolUrl(data.symbolUrl);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (e) {
        console.error("Failed to generate symbol:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    generateSymbol();
  }, [dream.id, dream.notes, dream.world, dream.environments, dream.threatLevel, mood]);

  return { symbolUrl, loading, error };
}
