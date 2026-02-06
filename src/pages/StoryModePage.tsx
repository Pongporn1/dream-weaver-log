import { useState, useEffect, useCallback, useRef } from "react";
import { getDreamLogs, getWorlds, getEntities } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { DreamLog, World, Entity } from "@/types/dream";
import { StoryMode } from "@/pages/StoryMode";

export default function StoryModePage() {
  const [dreams, setDreams] = useState<DreamLog[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshDebounceRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [dreamsData, worldsData, entitiesData] = await Promise.all([
        getDreamLogs(),
        getWorlds(),
        getEntities(),
      ]);

      if (!isMountedRef.current) return;
      setDreams(dreamsData);
      setWorlds(worldsData);
      setEntities(entitiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (showLoading && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const scheduleRefresh = () => {
      if (refreshDebounceRef.current !== null) {
        window.clearTimeout(refreshDebounceRef.current);
      }
      refreshDebounceRef.current = window.setTimeout(() => {
        void loadData(false);
      }, 300);
    };

    const refreshFromFocus = () => {
      void loadData(false);
    };

    const refreshFromVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadData(false);
      }
    };

    void loadData(true);

    const pollInterval = window.setInterval(() => {
      void loadData(false);
    }, 15000);

    const channel = supabase
      .channel("story-mode-live-data")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dream_logs" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dream_log_entities" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "worlds" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entities" },
        scheduleRefresh,
      )
      .subscribe();

    window.addEventListener("focus", refreshFromFocus);
    document.addEventListener("visibilitychange", refreshFromVisibility);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(pollInterval);
      window.removeEventListener("focus", refreshFromFocus);
      document.removeEventListener("visibilitychange", refreshFromVisibility);
      if (refreshDebounceRef.current !== null) {
        window.clearTimeout(refreshDebounceRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
  }

  return <StoryMode dreams={dreams} worlds={worlds} entities={entities} />;
}
