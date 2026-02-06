import { useState, useEffect, ReactNode, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Save,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DRAFT_STORAGE_KEY = "dream-log-draft-v2";

type DreamFormState = {
  date: string;
  wakeTime: string;
  world: string;
  newWorld: string;
  timeSystem: DreamLog["timeSystem"];
  environments: string[];
  newEnvironment: string;
  selectedEntities: string[];
  newEntity: string;
  threatLevel: DreamLog["threatLevel"];
  safetyOverride: DreamLog["safetyOverride"];
  exit: DreamLog["exit"];
  notes: string;
  storySummary: string;
};

type DraftPayload = {
  version: number;
  savedAt: string;
  form: DreamFormState;
};

const createInitialForm = (): DreamFormState => ({
  date: new Date().toISOString().split("T")[0],
  wakeTime: "",
  world: "",
  newWorld: "",
  timeSystem: "unknown",
  environments: [],
  newEnvironment: "",
  selectedEntities: [],
  newEntity: "",
  threatLevel: 0,
  safetyOverride: "none",
  exit: "unknown",
  notes: "",
  storySummary: "",
});

const formatSavedTime = (date: Date) =>
  date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

function AnimatedField({
  children,
  delay = 0,
  duration = 400,
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="mb-4">
        <h2
          className="text-base font-semibold text-slate-900"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        >
          {title}
        </h2>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function NewDreamLog() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [draftState, setDraftState] = useState<
    "idle" | "saving" | "saved" | "restored" | "error"
  >("idle");
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const initialFormRef = useRef<DreamFormState>(createInitialForm());
  const [form, setForm] = useState<DreamFormState>(initialFormRef.current);
  const isMountedRef = useRef(true);
  const formRef = useRef(form);

  const isDraftEmpty = useCallback((data: DreamFormState) => {
    const baselineDate = initialFormRef.current.date;
    return (
      data.date === baselineDate &&
      !data.wakeTime &&
      !data.world &&
      !data.newWorld &&
      data.environments.length === 0 &&
      !data.newEnvironment &&
      data.selectedEntities.length === 0 &&
      !data.newEntity &&
      data.threatLevel === 0 &&
      data.timeSystem === "unknown" &&
      data.safetyOverride === "none" &&
      data.exit === "unknown" &&
      !data.notes &&
      !data.storySummary
    );
  }, []);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  useEffect(() => {
    let restored = false;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DraftPayload | null;
        if (parsed?.form) {
          setForm({ ...createInitialForm(), ...parsed.form });
          if (parsed.savedAt) {
            const parsedDate = new Date(parsed.savedAt);
            if (!Number.isNaN(parsedDate.getTime())) {
              setDraftSavedAt(parsedDate);
            }
          }
          setDraftState("restored");
          restored = true;
        }
      }
    } catch (error) {
      console.warn("Failed to restore draft:", error);
    }

    if (restored) {
      toast({
        title: "คืนค่าร่างล่าสุดแล้ว",
        description: "ข้อมูลถูกเก็บไว้ในเครื่องของคุณ",
      });
    }
    setDraftReady(true);
  }, []);

  const persistDraft = useCallback(
    (nextForm: DreamFormState, silent = false) => {
      try {
        if (isDraftEmpty(nextForm)) {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          if (!silent && isMountedRef.current) {
            setDraftState("idle");
            setDraftSavedAt(null);
          }
          return;
        }

        const now = new Date();
        const payload: DraftPayload = {
          version: 1,
          savedAt: now.toISOString(),
          form: nextForm,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        if (!silent && isMountedRef.current) {
          setDraftState("saved");
          setDraftSavedAt(now);
        }
      } catch (error) {
        if (!silent && isMountedRef.current) {
          setDraftState("error");
        }
        console.warn("Failed to persist draft:", error);
      }
    },
    [isDraftEmpty],
  );

  useEffect(() => {
    if (!draftReady) return;
    if (isDraftEmpty(form)) {
      persistDraft(form);
      return;
    }
    setDraftState("saving");
    const timeout = setTimeout(() => persistDraft(form), 700);
    return () => clearTimeout(timeout);
  }, [form, draftReady, persistDraft, isDraftEmpty]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDraftEmpty(formRef.current)) return;
      try {
        const now = new Date();
        const payload: DraftPayload = {
          version: 1,
          savedAt: now.toISOString(),
          form: formRef.current,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.warn("Failed to save draft on unload:", error);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDraftEmpty]);

  const saveDream = useCallback(async () => {
    if (saving) return;

    setSaving(true);
    try {
      const worldName = form.newWorld || form.world;
      const entityNames = [...form.selectedEntities];
      if (form.newEntity) entityNames.push(form.newEntity);

      const environmentNames = [...form.environments];
      if (form.newEnvironment) environmentNames.push(form.newEnvironment);

      const fullNotes = [form.storySummary, form.notes]
        .filter(Boolean)
        .join("\n\n---\n\n");

      const wakeTimeValue =
        form.wakeTime || new Date().toTimeString().slice(0, 5);

      const result = await addDreamLog({
        date: form.date,
        wakeTime: wakeTimeValue,
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
        const emptyForm = createInitialForm();
        initialFormRef.current = emptyForm;
        persistDraft(emptyForm);
        navigate("/logs");
      } else {
        toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving dream:", error);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [form, saving, navigate, persistDraft]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      saveDream();
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveDream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDream();
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

  const handleClearDraft = () => {
    const emptyForm = createInitialForm();
    initialFormRef.current = emptyForm;
    setForm(emptyForm);
    persistDraft(emptyForm);
    toast({ title: "ล้างแบบร่างแล้ว" });
  };

  const draftBadge = useMemo(() => {
    if (draftState === "saving") {
      return {
        label: "กำลังบันทึกอัตโนมัติ...",
        className: "bg-amber-100/80 text-amber-700 border-amber-200/80",
        icon: Clock3,
      };
    }
    if (draftState === "saved" && draftSavedAt) {
      return {
        label: `บันทึกล่าสุด ${formatSavedTime(draftSavedAt)}`,
        className: "bg-emerald-100/80 text-emerald-700 border-emerald-200/80",
        icon: CheckCircle2,
      };
    }
    if (draftState === "restored") {
      return {
        label: "กู้คืนแบบร่างล่าสุดแล้ว",
        className: "bg-sky-100/80 text-sky-700 border-sky-200/80",
        icon: RotateCcw,
      };
    }
    if (draftState === "error") {
      return {
        label: "บันทึกอัตโนมัติไม่สำเร็จ",
        className: "bg-rose-100/80 text-rose-700 border-rose-200/80",
        icon: AlertTriangle,
      };
    }
    return {
      label: "บันทึกอัตโนมัติเปิดอยู่",
      className: "bg-slate-100/80 text-slate-600 border-slate-200/80",
      icon: ShieldCheck,
    };
  }, [draftState, draftSavedAt]);

  const DraftIcon = draftBadge.icon;

  return (
    <div className="space-y-6 pb-8">
      <AnimatedField delay={0} duration={400}>
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-[#fff7ed] via-[#fef3c7]/70 to-[#ecfeff] p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.5)]">
          <div className="absolute -top-20 right-6 h-32 w-32 rounded-full bg-amber-200/60 blur-3xl" />
          <div className="absolute -bottom-24 left-4 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1
                  className="text-3xl text-slate-900"
                  style={{ fontFamily: "DM Serif Display, serif" }}
                >
                  บันทึกฝันใหม่
                </h1>
                <p className="text-sm text-slate-600">
                  โหมดกรอกเองแบบเร็ว ไม่มีฟีเจอร์สร้างปก
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="gap-2 bg-slate-900 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.7)] hover:bg-slate-800"
              disabled={saving}
              onClick={saveDream}
            >
              <Save className="w-4 h-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${draftBadge.className}`}
            >
              <DraftIcon className="h-3.5 w-3.5" />
              {draftBadge.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs text-slate-600">
              กด Ctrl/Cmd+S เพื่อบันทึกเร็ว
            </span>
            <button
              type="button"
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs text-slate-600 transition hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              ล้างแบบร่าง
            </button>
          </div>
        </div>
      </AnimatedField>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimatedField delay={80} duration={400}>
            <SectionCard
              title="เรื่องย่อความฝัน"
              description="เล่าแบบสั้นหรือยาวตามที่จำได้ ระบบจะบันทึกรวมกับ notes"
            >
              <div className="space-y-2">
                <Label htmlFor="storySummary">เรื่องย่อ</Label>
                <Textarea
                  id="storySummary"
                  placeholder="เล่าเหตุการณ์ในฝัน..."
                  value={form.storySummary}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, storySummary: e.target.value }))
                  }
                  className="min-h-[160px]"
                />
              </div>
            </SectionCard>
          </AnimatedField>

          <AnimatedField delay={140} duration={400}>
            <div className="space-y-6">
              <SectionCard
                title="วันที่และเวลาตื่น"
                description="กรอกเท่าที่จำได้ หากไม่ใส่เวลาตื่น ระบบจะใช้เวลาตอนบันทึก"
              >
                <DateTimeFields
                  date={form.date}
                  wakeTime={form.wakeTime}
                  onDateChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
                  onWakeTimeChange={(v) =>
                    setForm((prev) => ({ ...prev, wakeTime: v }))
                  }
                />
              </SectionCard>

              <SectionCard
                title="โลกในฝัน"
                description="เลือกโลกเดิม หรือพิมพ์โลกใหม่ได้ทันที"
              >
                <WorldSelector
                  worlds={worlds}
                  selectedWorld={form.world}
                  newWorld={form.newWorld}
                  onWorldChange={(v) => setForm((prev) => ({ ...prev, world: v }))}
                  onNewWorldChange={(v) =>
                    setForm((prev) => ({ ...prev, newWorld: v }))
                  }
                />
              </SectionCard>

              <SectionCard title="รายละเอียดเพิ่มเติม (ไม่จำเป็น)">
                <Accordion type="single" collapsible>
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="px-0 text-left text-sm font-medium text-slate-700 hover:no-underline">
                      ปรับความเข้มข้นและองค์ประกอบของฝัน
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-6">
                        <DreamSettings
                          timeSystem={form.timeSystem}
                          threatLevel={form.threatLevel}
                          safetyOverride={form.safetyOverride}
                          exit={form.exit}
                          onTimeSystemChange={(v) =>
                            setForm((prev) => ({ ...prev, timeSystem: v }))
                          }
                          onThreatLevelChange={(v) =>
                            setForm((prev) => ({ ...prev, threatLevel: v }))
                          }
                          onSafetyOverrideChange={(v) =>
                            setForm((prev) => ({ ...prev, safetyOverride: v }))
                          }
                          onExitChange={(v) =>
                            setForm((prev) => ({ ...prev, exit: v }))
                          }
                        />

                        <EnvironmentSelector
                          selectedEnvironments={form.environments}
                          newEnvironment={form.newEnvironment}
                          onToggleEnvironment={toggleEnvironment}
                          onNewEnvironmentChange={(v) =>
                            setForm((prev) => ({ ...prev, newEnvironment: v }))
                          }
                          onAddEnvironment={handleAddEnvironment}
                        />

                        <EntitySelector
                          entities={entities}
                          selectedEntities={form.selectedEntities}
                          newEntity={form.newEntity}
                          onToggleEntity={toggleEntity}
                          onNewEntityChange={(v) =>
                            setForm((prev) => ({ ...prev, newEntity: v }))
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SectionCard>
            </div>
          </AnimatedField>
        </div>

        <AnimatedField delay={200} duration={400}>
          <SectionCard
            title="Notes เพิ่มเติม"
            description="ถ้ามีรายละเอียดที่อยากเก็บไว้ เช่น สัญลักษณ์ หรือความหมาย"
          >
            <div className="space-y-2">
              <Label htmlFor="notes">รายละเอียดเพิ่มเติม (optional)</Label>
              <Textarea
                id="notes"
                placeholder="พิมพ์เพิ่มเติมที่นี่..."
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="min-h-[120px]"
              />
            </div>
          </SectionCard>
        </AnimatedField>

        <AnimatedField delay={260} duration={400}>
          <div className="sticky bottom-24 z-10">
            <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    พร้อมบันทึกแล้ว
                  </p>
                  <p className="text-xs text-slate-500">
                    ระบบจะเก็บร่างล่าสุดไว้ให้อัตโนมัติ
                  </p>
                </div>
                <Button
                  type="submit"
                  className="gap-2 bg-slate-900 text-white shadow-[0_14px_30px_-18px_rgba(15,23,42,0.7)] hover:bg-slate-800"
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </div>
          </div>
        </AnimatedField>
      </form>
    </div>
  );
}
