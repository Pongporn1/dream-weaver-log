import {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Save,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Zap,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDreamLog, getWorlds, getEntities } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "@/hooks/use-toast";
import {
  getTopEntities,
  incrementEntityFrequency,
} from "@/lib/entityFrequency";
import {
  getTopEnvironments,
  incrementEnvironmentFrequency,
} from "@/lib/environmentFrequency";
import {
  DateTimeFields,
  WorldSelector,
  EnvironmentSelector,
  EntitySelector,
  DreamSettings,
} from "@/components/dream-form";
import { DreamTypeSelector } from "@/components/dream-form/DreamTypeSelector";
import { QuickCaptureMode } from "@/components/dream-form/QuickCaptureMode";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getDrafts,
  saveDraft,
  loadDraft,
  deleteDraft,
  createNewDraft,
  getActiveDraftId,
  setActiveDraftId,
  migrateLegacyDraft,
  getRecentDrafts,
  type DraftMetadata,
} from "@/lib/draftManager";
import { DraftSelector } from "@/components/dream-form/DraftSelector";

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
  dreamTypes: string[];
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
  dreamTypes: [],
  threatLevel: 0,
  safetyOverride: "none",
  exit: "unknown",
  notes: "",
  storySummary: "",
});

const formatSavedTime = (date: Date) =>
  date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export default function NewDreamLog() {
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<{ id: string; name: string }[]>([]);
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [topEntities, setTopEntities] = useState<string[]>([]);
  const [topEnvironments, setTopEnvironments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [draftState, setDraftState] = useState<
    "idle" | "saving" | "saved" | "restored" | "error"
  >("idle");
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  // Multi-draft states
  const [activeDraftId, setActiveDraftIdState] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, DraftMetadata>>({});
  const [showDraftSelector, setShowDraftSelector] = useState(false);

  const initialFormRef = useRef<DreamFormState>(createInitialForm());
  const [form, setForm] = useState<DreamFormState>(initialFormRef.current);
  const isMountedRef = useRef(true);
  const [quickMode, setQuickMode] = useState(false);
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

      // โหลด Top 9 ตัวละครที่ใช้บ่อยที่สุด
      setTopEntities(getTopEntities(9));
      // โหลด Top 6 สภาพแวดล้อมที่ใช้บ่อยที่สุด
      setTopEnvironments(getTopEnvironments(6));
    };
    loadData();
  }, []);

  useEffect(() => {
    let restored = false;
    try {
      // 1. Migrate legacy draft if exists
      const migrated = migrateLegacyDraft();

      // 2. Load active draft ID
      const activeId = getActiveDraftId();

      // 3. If has active ID, load that draft
      if (activeId) {
        const draft = loadDraft(activeId);
        if (draft) {
          setForm({ ...createInitialForm(), ...draft.form });
          setActiveDraftIdState(activeId);
          if (draft.savedAt) {
            const parsedDate = new Date(draft.savedAt);
            if (!Number.isNaN(parsedDate.getTime())) {
              setDraftSavedAt(parsedDate);
            }
          }
          setDraftState("restored");
          restored = true;
        }
      }

      // 4. Load all drafts for selector
      const allDrafts = getDrafts();
      setDrafts(allDrafts.drafts);

      if (migrated && restored) {
        toast({
          title: "คืนค่าร่างล่าสุดแล้ว",
          description: "แบบร่างเก่าถูกย้ายมาระบบใหม่เรียบร้อยแล้ว",
        });
      } else if (restored) {
        toast({
          title: "คืนค่าร่างล่าสุดแล้ว",
          description: "ข้อมูลถูกเก็บไว้ในเครื่องของคุณ",
        });
      }
    } catch (error) {
      console.warn("Failed to restore draft:", error);
    }

    setDraftReady(true);
  }, []);

  const persistDraft = useCallback(
    (nextForm: DreamFormState, silent = false) => {
      try {
        if (isDraftEmpty(nextForm)) {
          // Don't remove, just don't save
          return;
        }

        let draftId = activeDraftId;

        // If no active draft, create new one
        if (!draftId) {
          draftId = createNewDraft(nextForm);
          setActiveDraftIdState(draftId);
          setActiveDraftId(draftId);
        } else {
          // Update existing draft
          saveDraft(draftId, nextForm);
        }

        // Update local state
        const allDrafts = getDrafts();
        setDrafts(allDrafts.drafts);

        if (!silent && isMountedRef.current) {
          setDraftState("saved");
          setDraftSavedAt(new Date());
        }
      } catch (error) {
        if (!silent && isMountedRef.current) {
          setDraftState("error");
        }
        console.warn("Failed to persist draft:", error);
      }
    },
    [isDraftEmpty, activeDraftId],
  );

  useEffect(() => {
    if (!draftReady) return;
    if (isDraftEmpty(form)) {
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
        const draftId = getActiveDraftId();
        if (draftId) {
          saveDraft(draftId, formRef.current);
        } else {
          createNewDraft(formRef.current);
        }
      } catch (error) {
        console.warn("Failed to save draft on unload:", error);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDraftEmpty]);

  const saveDream = useCallback(async () => {
    if (saving) return;

    // ตรวจสอบว่าต้องมีข้อมูลอย่างน้อย storySummary หรือ notes
    if (!form.storySummary.trim() && !form.notes.trim()) {
      toast({
        title: "ไม่สามารถบันทึกได้",
        description: "กรุณากรอกเรื่องย่อความฝันหรือ Notes อย่างน้อย 1 อย่าง",
        variant: "destructive",
      });
      return;
    }

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
        dreamTypes: form.dreamTypes.length > 0 ? form.dreamTypes : undefined,
        threatLevel: form.threatLevel,
        safetyOverride: form.safetyOverride,
        exit: form.exit,
        notes: fullNotes || undefined,
      });

      if (result) {
        // อัพเดทความถี่การใช้งานตัวละคร
        incrementEntityFrequency(entityNames);
        // โหลดค่าใหม่ทันที
        setTopEntities(getTopEntities(9));

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
    if (
      form.newEnvironment &&
      !form.environments.includes(form.newEnvironment)
    ) {
      setForm((prev) => ({
        ...prev,
        environments: [...prev.environments, prev.newEnvironment],
        newEnvironment: "",
      }));
    }
  };

  const handleAddEntity = () => {
    if (form.newEntity && !form.selectedEntities.includes(form.newEntity)) {
      setForm((prev) => ({
        ...prev,
        selectedEntities: [...prev.selectedEntities, prev.newEntity],
        newEntity: "",
      }));
    }
  };

  const handleClearDraft = () => {
    const emptyForm = createInitialForm();
    initialFormRef.current = emptyForm;
    setForm(emptyForm);
    setActiveDraftIdState(null);
    setActiveDraftId(null);
    toast({ title: "สร้างแบบร่างใหม่" });
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = loadDraft(draftId);
    if (draft) {
      setForm({ ...createInitialForm(), ...draft.form });
      setActiveDraftIdState(draftId);
      setActiveDraftId(draftId);
      setShowDraftSelector(false);
      toast({ title: "โหลดแบบร่าง", description: draft.title });
    }
  };

  const handleNewDraft = () => {
    const emptyForm = createInitialForm();
    setForm(emptyForm);
    setActiveDraftIdState(null);
    setActiveDraftId(null);
    setShowDraftSelector(false);
    toast({ title: "สร้างแบบร่างใหม่" });
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    const allDrafts = getDrafts();
    setDrafts(allDrafts.drafts);

    if (activeDraftId === draftId) {
      handleNewDraft();
    }

    toast({ title: "ลบแบบร่างแล้ว" });
  };

  const draftBadge = useMemo(() => {
    if (draftState === "saving") {
      return {
        label: "กำลังบันทึกอัตโนมัติ...",
        className: "bg-muted border-border text-muted-foreground",
        icon: Clock3,
      };
    }
    if (draftState === "saved" && draftSavedAt) {
      return {
        label: `บันทึกล่าสุด ${formatSavedTime(draftSavedAt)}`,
        className: "bg-muted border-border text-foreground",
        icon: CheckCircle2,
      };
    }
    if (draftState === "restored") {
      return {
        label: "กู้คืนแบบร่างล่าสุดแล้ว",
        className: "bg-primary/10 border-primary/20 text-primary",
        icon: RotateCcw,
      };
    }
    if (draftState === "error") {
      return {
        label: "บันทึกอัตโนมัติไม่สำเร็จ",
        className: "bg-destructive/10 border-destructive/20 text-destructive",
        icon: AlertTriangle,
      };
    }
    return {
      label: "บันทึกอัตโนมัติเปิดอยู่",
      className: "bg-muted border-border text-muted-foreground",
      icon: ShieldCheck,
    };
  }, [draftState, draftSavedAt]);

  const DraftIcon = draftBadge.icon;

  return (
    <div className="space-y-6 pb-8">
      {/* Minimal Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20 backdrop-blur-sm bg-card/95">
        <div className="container-app py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold truncate">
                บันทึกฝันใหม่
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuickMode(!quickMode)}
                title={
                  quickMode ? "เปลี่ยนเป็นโหมดเต็ม" : "เปลี่ยนเป็นโหมดเร็ว"
                }
              >
                {quickMode ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={saveDream} disabled={saving}>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md ${draftBadge.className}`}
            >
              <DraftIcon className="w-3 h-3" />
              {draftBadge.label}
            </span>
            <button
              type="button"
              onClick={() => setShowDraftSelector(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border bg-muted text-muted-foreground rounded-md hover:text-foreground transition"
            >
              <FolderOpen className="w-3 h-3" />
              แบบร่าง ({Object.keys(drafts).length})
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border bg-muted text-muted-foreground rounded-md">
              กด Ctrl/Cmd+S เพื่อบันทึกเร็ว
            </span>
            <button
              type="button"
              onClick={handleNewDraft}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border bg-muted text-muted-foreground rounded-md hover:text-foreground transition"
            >
              <RotateCcw className="w-3 h-3" />
              แบบร่างใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Draft Selector */}
      <DraftSelector
        open={showDraftSelector}
        onOpenChange={setShowDraftSelector}
        drafts={getRecentDrafts()}
        activeDraftId={activeDraftId}
        onSelectDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onNewDraft={handleNewDraft}
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="container-app space-y-4 sm:space-y-6 pb-32"
      >
        {quickMode ? (
          <QuickCaptureMode
            form={{
              date: form.date,
              wakeTime: form.wakeTime,
              world: form.world,
              storySummary: form.storySummary,
              dreamTypes: form.dreamTypes,
            }}
            onFormChange={(updates) =>
              setForm((prev) => ({ ...prev, ...updates }))
            }
            onSave={saveDream}
            onSwitchToFull={() => setQuickMode(false)}
            saving={saving}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* LEFT COLUMN - Story Summary */}
              <div className="lg:row-span-2">
                <div className="card-minimal p-3 sm:p-4 h-full">
                  <div className="mb-3">
                    <Label
                      htmlFor="storySummary"
                      className="text-base font-medium"
                    >
                      เรื่องย่อความฝัน
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      เล่าแบบสั้นหรือยาวตามที่จำได้
                    </p>
                  </div>
                  <Textarea
                    id="storySummary"
                    placeholder="เล่าเหตุการณ์ในฝัน..."
                    value={form.storySummary}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        storySummary: e.target.value,
                      }))
                    }
                    className="min-h-[200px] sm:min-h-[240px] lg:min-h-[320px]"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4 sm:space-y-6">
                {/* Date/Time Card */}
                <div className="card-minimal p-3 sm:p-4">
                  <div className="mb-3">
                    <h2 className="text-base font-medium">วันที่และเวลาตื่น</h2>
                  </div>
                  <DateTimeFields
                    date={form.date}
                    wakeTime={form.wakeTime}
                    onDateChange={(v) =>
                      setForm((prev) => ({ ...prev, date: v }))
                    }
                    onWakeTimeChange={(v) =>
                      setForm((prev) => ({ ...prev, wakeTime: v }))
                    }
                  />
                </div>

                {/* World Card */}
                <div className="card-minimal p-3 sm:p-4">
                  <div className="mb-3">
                    <h2 className="text-base font-medium">โลกในฝัน</h2>
                  </div>
                  <WorldSelector
                    worlds={worlds}
                    selectedWorld={form.world}
                    newWorld={form.newWorld}
                    onWorldChange={(v) =>
                      setForm((prev) => ({ ...prev, world: v }))
                    }
                    onNewWorldChange={(v) =>
                      setForm((prev) => ({ ...prev, newWorld: v }))
                    }
                  />
                </div>

                {/* Additional Details Accordion */}
                <div className="card-minimal p-3 sm:p-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="details" className="border-none">
                      <AccordionTrigger className="px-0 py-0 text-base font-medium hover:no-underline">
                        รายละเอียดเพิ่มเติม
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4 sm:space-y-6">
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
                          commonEnvironments={topEnvironments}
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
                          commonEntities={topEntities}
                          onToggleEntity={toggleEntity}
                          onNewEntityChange={(v) =>
                            setForm((prev) => ({ ...prev, newEntity: v }))
                          }
                          onAddEntity={handleAddEntity}
                        />

                        <DreamTypeSelector
                          selectedTypes={form.dreamTypes}
                          onToggleType={(type) => {
                            setForm((prev) => ({
                              ...prev,
                              dreamTypes: prev.dreamTypes.includes(type)
                                ? prev.dreamTypes.filter((t) => t !== type)
                                : [...prev.dreamTypes, type],
                            }));
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </div>

            {/* FULL WIDTH - Notes */}
            <div className="card-minimal p-3 sm:p-4">
              <div className="mb-3">
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes เพิ่มเติม
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  รายละเอียดเสริมที่อยากเก็บไว้
                </p>
              </div>
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
          </>
        )}
      </form>
    </div>
  );
}
