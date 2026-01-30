import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDreamLog, getWorlds, getEntities } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DateTimeFields,
  WorldSelector,
  EnvironmentSelector,
  EntitySelector,
  DreamSettings,
  StoryDetailsFields,
  CoverPreview,
} from "@/components/dream-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Animation wrapper component
function AnimatedField({ 
  children, 
  delay = 0, 
  duration = 400 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className="transition-all"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
}

export default function NewDreamLog() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showCoverDialog, setShowCoverDialog] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    wakeTime: "",
    world: "",
    newWorld: "",
    timeSystem: "unknown" as DreamLog["timeSystem"],
    environments: [] as string[],
    newEnvironment: "",
    selectedEntities: [] as string[],
    newEntity: "",
    threatLevel: 0 as DreamLog["threatLevel"],
    safetyOverride: "none" as DreamLog["safetyOverride"],
    exit: "unknown" as DreamLog["exit"],
    notes: "",
    // New detailed fields
    storySummary: "",
    emotions: [] as string[],
    atmosphereColors: [] as string[],
    lucidityLevel: 5,
  });

  useEffect(() => {
    const loadData = async () => {
      const [worldsData, entitiesData] = await Promise.all([
        getWorlds(),
        getEntities(),
      ]);
      setWorlds(worldsData.map((w) => ({ id: w.id, name: w.name })));
      setEntities(entitiesData.map((e) => ({ id: e.id, name: e.name })));
    };
    loadData();
  }, []);

  const generateCover = async () => {
    setGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cover", {
        body: {
          storySummary: form.storySummary || form.notes,
          emotions: form.emotions,
          atmosphereColors: form.atmosphereColors,
          environments: form.environments,
          world: form.newWorld || form.world,
          threatLevel: form.threatLevel,
          lucidityLevel: form.lucidityLevel,
        },
      });

      if (error) {
        console.error("Cover generation error:", error);
        toast({
          title: "ไม่สามารถสร้างปกได้",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      if (data?.coverUrl) {
        setCoverUrl(data.coverUrl);
        return data.coverUrl;
      }
      return null;
    } catch (err) {
      console.error("Cover generation failed:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างปกได้",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const worldName = form.newWorld || form.world;
      const entityNames = [...form.selectedEntities];
      if (form.newEntity) entityNames.push(form.newEntity);

      const environmentNames = [...form.environments];
      if (form.newEnvironment) environmentNames.push(form.newEnvironment);

      // Combine notes with story summary
      const fullNotes = [form.storySummary, form.notes]
        .filter(Boolean)
        .join("\n\n---\n\n");

      const result = await addDreamLog({
        date: form.date,
        wakeTime: form.wakeTime,
        world: worldName,
        timeSystem: form.timeSystem,
        environments: environmentNames,
        entities: entityNames,
        threatLevel: form.threatLevel,
        safetyOverride: form.safetyOverride,
        exit: form.exit,
        notes: fullNotes || undefined,
      });

      if (result) {
        toast({ title: "บันทึกเรียบร้อย" });
        
        // Generate cover after saving
        if (form.storySummary || form.notes) {
          setShowCoverDialog(true);
          await generateCover();
        } else {
          navigate("/logs");
        }
      } else {
        toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving dream:", error);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleEnvironment = (env: string) => {
    setForm((prev) => ({
      ...prev,
      environments: prev.environments.includes(env)
        ? prev.environments.filter((e) => e !== env)
        : [...prev.environments, env],
    }));
  };

  const toggleEntity = (entityName: string) => {
    setForm((prev) => ({
      ...prev,
      selectedEntities: prev.selectedEntities.includes(entityName)
        ? prev.selectedEntities.filter((e) => e !== entityName)
        : [...prev.selectedEntities, entityName],
    }));
  };

  const handleAddEnvironment = () => {
    if (form.newEnvironment && !form.environments.includes(form.newEnvironment)) {
      setForm((prev) => ({
        ...prev,
        environments: [...prev.environments, prev.newEnvironment],
        newEnvironment: "",
      }));
    }
  };

  const handleCloseCoverDialog = () => {
    setShowCoverDialog(false);
    navigate("/logs");
  };

  return (
    <div className="py-4 pb-28">
      <AnimatedField delay={0} duration={400}>
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              บันทึกฝันใหม่
            </h1>
            <p className="text-xs text-muted-foreground">
              บันทึกรายละเอียดเพื่อสร้างปกหนังสืออัตโนมัติ
            </p>
          </div>
        </div>
      </AnimatedField>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Details Section - New prominent section */}
        <AnimatedField delay={60} duration={400}>
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">รายละเอียดความฝัน</h2>
            </div>
            <StoryDetailsFields
              storySummary={form.storySummary}
              onStorySummaryChange={(v) => setForm((prev) => ({ ...prev, storySummary: v }))}
              emotions={form.emotions}
              onEmotionsChange={(v) => setForm((prev) => ({ ...prev, emotions: v }))}
              atmosphereColors={form.atmosphereColors}
              onAtmosphereColorsChange={(v) => setForm((prev) => ({ ...prev, atmosphereColors: v }))}
              lucidityLevel={form.lucidityLevel}
              onLucidityLevelChange={(v) => setForm((prev) => ({ ...prev, lucidityLevel: v }))}
            />
          </div>
        </AnimatedField>

        <AnimatedField delay={120} duration={400}>
          <DateTimeFields
            date={form.date}
            wakeTime={form.wakeTime}
            onDateChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
            onWakeTimeChange={(v) => setForm((prev) => ({ ...prev, wakeTime: v }))}
          />
        </AnimatedField>

        <AnimatedField delay={180} duration={400}>
          <WorldSelector
            worlds={worlds}
            selectedWorld={form.world}
            newWorld={form.newWorld}
            onWorldChange={(v) => setForm((prev) => ({ ...prev, world: v }))}
            onNewWorldChange={(v) => setForm((prev) => ({ ...prev, newWorld: v }))}
          />
        </AnimatedField>

        <AnimatedField delay={240} duration={400}>
          <DreamSettings
            timeSystem={form.timeSystem}
            threatLevel={form.threatLevel}
            safetyOverride={form.safetyOverride}
            exit={form.exit}
            onTimeSystemChange={(v) => setForm((prev) => ({ ...prev, timeSystem: v }))}
            onThreatLevelChange={(v) => setForm((prev) => ({ ...prev, threatLevel: v }))}
            onSafetyOverrideChange={(v) => setForm((prev) => ({ ...prev, safetyOverride: v }))}
            onExitChange={(v) => setForm((prev) => ({ ...prev, exit: v }))}
          />
        </AnimatedField>

        <AnimatedField delay={300} duration={400}>
          <EnvironmentSelector
            selectedEnvironments={form.environments}
            newEnvironment={form.newEnvironment}
            onToggleEnvironment={toggleEnvironment}
            onNewEnvironmentChange={(v) => setForm((prev) => ({ ...prev, newEnvironment: v }))}
            onAddEnvironment={handleAddEnvironment}
          />
        </AnimatedField>

        <AnimatedField delay={360} duration={400}>
          <EntitySelector
            entities={entities}
            selectedEntities={form.selectedEntities}
            newEntity={form.newEntity}
            onToggleEntity={toggleEntity}
            onNewEntityChange={(v) => setForm((prev) => ({ ...prev, newEntity: v }))}
          />
        </AnimatedField>

        {/* Additional Notes */}
        <AnimatedField delay={420} duration={400}>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes เพิ่มเติม (optional)</Label>
            <Textarea
              id="notes"
              placeholder="รายละเอียดเพิ่มเติม เช่น ความหมายที่คิดว่ามี, สัญลักษณ์พิเศษ..."
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
        </AnimatedField>

        <AnimatedField delay={480} duration={400}>
          <Button type="submit" className="w-full gap-2" disabled={saving || generatingCover}>
            {saving ? (
              "กำลังบันทึก..."
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                บันทึกและสร้างปก
              </>
            )}
          </Button>
        </AnimatedField>
      </form>

      {/* Cover Generation Dialog */}
      <Dialog open={showCoverDialog} onOpenChange={setShowCoverDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              ปกหนังสือความฝัน
            </DialogTitle>
          </DialogHeader>
          <CoverPreview
            coverUrl={coverUrl}
            isGenerating={generatingCover}
            onRegenerate={generateCover}
            dreamTitle={form.storySummary?.slice(0, 50) || form.world}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCloseCoverDialog}>
              ปิด
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
