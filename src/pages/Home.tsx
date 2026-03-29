import { useState, useEffect, useCallback, useRef } from "react";
import { getDreamLogs, getWorlds, getEntities } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintableDreamBook } from "@/components/library/PrintableDreamBook";
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
  const [allDreams, setAllDreams] = useState<DreamLog[]>([]);
  const [recentDreams, setRecentDreams] = useState<DreamLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingWorlds, setExistingWorlds] = useState<string[]>([]);
  const [existingEntities, setExistingEntities] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const homeRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [dreams, worlds, entities] = await Promise.all([
        getDreamLogs(),
        getWorlds(),
        getEntities(),
      ]);
      setAllDreams(dreams);
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

  const handleExportPDF = () => {
    // Simply use the browser's native print, which has been configured
    // via CSS (@media print) to render the PrintableDreamBook component
    // and hide the rest of the website's UI.
    window.print();
  };

  return (
    <>
      <PrintableDreamBook dreams={allDreams} />
      <div className="min-h-screen bg-background flex flex-col print:hidden" ref={homeRef}>
      <OfflineIndicator />
      <AnimatedProfileHeader dreams={allDreams} />

      <PullToRefresh onRefresh={handleRefresh} className="flex-1">
        <div className="space-y-8 py-4 pb-28 container-app">
          <HomeGreeting />

          <QuickDreamEntry
            existingWorlds={existingWorlds}
            existingEntities={existingEntities}
            onDreamSaved={setRecentDreams}
          />

          <QuickActions />

          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 h-12"
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isExporting ? "กำลังจัดทำรูปเล่ม..." : "ส่งออกเป็นหนังสือ PDF"}
            </Button>
          </div>

          {loading ? (
            <HomeSkeleton />
          ) : (
            <RecentDreams dreams={recentDreams} />
          )}
        </div>
      </PullToRefresh>

      <BottomNavigation />
    </div>
    </>
  );
}
