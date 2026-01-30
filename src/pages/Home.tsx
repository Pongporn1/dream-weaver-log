import { useState, useEffect, useCallback } from "react";
import { getDreamLogs, getWorlds, getEntities } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "sonner";
import { AnimatedProfileHeader } from "@/components/AnimatedProfileHeader";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { BottomNavigation } from "@/components/BottomNavigation";
import { HomeGreeting } from "@/components/home/HomeGreeting";
import { QuickDreamEntry } from "@/components/home/QuickDreamEntry";
import { QuickActions } from "@/components/home/QuickActions";
import { RecentDreams } from "@/components/home/RecentDreams";

export default function Home() {
  const [recentDreams, setRecentDreams] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingWorlds, setExistingWorlds] = useState<string[]>([]);
  const [existingEntities, setExistingEntities] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [dreams, worlds, entities] = await Promise.all([
        getDreamLogs(),
        getWorlds(),
        getEntities(),
      ]);
      setRecentDreams(dreams.slice(0, 5));
      setExistingWorlds(worlds.map((w) => w.name));
      setExistingEntities(entities.map((e) => e.name));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    await loadData();
    toast.success("รีเฟรชข้อมูลแล้ว");
  }, [loadData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OfflineIndicator />
      <AnimatedProfileHeader />

      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
        <div className="space-y-8 py-4 pb-28 container-app">
          <HomeGreeting />

          <QuickDreamEntry
            existingWorlds={existingWorlds}
            existingEntities={existingEntities}
            onDreamSaved={setRecentDreams}
          />

          <QuickActions />

          {loading ? (
            <HomeSkeleton />
          ) : (
            <RecentDreams dreams={recentDreams} />
          )}
        </div>
      </PullToRefresh>

      <BottomNavigation />
    </div>
  );
}
