import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDreamLog, getWorlds, getEntities } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "@/hooks/use-toast";
import {
  DateTimeFields,
  WorldSelector,
  EnvironmentSelector,
  EntitySelector,
  DreamSettings,
} from "@/components/dream-form";

export default function NewDreamLog() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const worldName = form.newWorld || form.world;
      const entityNames = [...form.selectedEntities];
      if (form.newEntity) entityNames.push(form.newEntity);

      const environmentNames = [...form.environments];
      if (form.newEnvironment) environmentNames.push(form.newEnvironment);

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
        notes: form.notes || undefined,
      });

      if (result) {
        toast({ title: "บันทึกเรียบร้อย" });
        navigate("/logs");
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

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1>บันทึกฝันใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <DateTimeFields
          date={form.date}
          wakeTime={form.wakeTime}
          onDateChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
          onWakeTimeChange={(v) => setForm((prev) => ({ ...prev, wakeTime: v }))}
        />

        <WorldSelector
          worlds={worlds}
          selectedWorld={form.world}
          newWorld={form.newWorld}
          onWorldChange={(v) => setForm((prev) => ({ ...prev, world: v }))}
          onNewWorldChange={(v) => setForm((prev) => ({ ...prev, newWorld: v }))}
        />

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

        <EnvironmentSelector
          selectedEnvironments={form.environments}
          newEnvironment={form.newEnvironment}
          onToggleEnvironment={toggleEnvironment}
          onNewEnvironmentChange={(v) => setForm((prev) => ({ ...prev, newEnvironment: v }))}
          onAddEnvironment={handleAddEnvironment}
        />

        <EntitySelector
          entities={entities}
          selectedEntities={form.selectedEntities}
          newEntity={form.newEntity}
          onToggleEntity={toggleEntity}
          onNewEntityChange={(v) => setForm((prev) => ({ ...prev, newEntity: v }))}
        />

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="รายละเอียดเพิ่มเติม..."
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="min-h-[80px]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </form>
    </div>
  );
}
