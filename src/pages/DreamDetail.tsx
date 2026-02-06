import { useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getDreamLogs, deleteDreamLog, updateDreamLog } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { DREAM_TYPE_LABELS } from "@/types/dream";
import { toast } from "sonner";
import { printDreamLog } from "@/lib/exportPdf";
import { DreamTypeSelector } from "@/components/dream-form/DreamTypeSelector";
import {
  DreamDetailHeader,
  DreamStatsGrid,
  DreamWorldEdit,
  DreamEnvironmentsEdit,
  DreamEntitiesEdit,
  DreamNotesEdit,
} from "@/components/dream-detail";

// Animation wrapper component
function AnimatedSection({
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

export default function DreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<DreamLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    world: "",
    threatLevel: 0 as DreamLog["threatLevel"],
    timeSystem: "unknown" as DreamLog["timeSystem"],
    safetyOverride: "unknown" as DreamLog["safetyOverride"],
    exit: "unknown" as DreamLog["exit"],
    environments: [] as string[],
    entities: [] as string[],
    dreamTypes: [] as string[],
    notes: "",
  });

  useEffect(() => {
    const loadDream = async () => {
      try {
        const dreams = await getDreamLogs();
        const found = dreams.find((d) => d.id === id);
        setDream(found || null);

        if (found) {
          setEditForm({
            world: found.world,
            threatLevel: found.threatLevel,
            timeSystem: found.timeSystem,
            safetyOverride: found.safetyOverride,
            exit: found.exit,
            environments: found.environments,
            entities: found.entities,
            dreamTypes: found.dreamTypes || [],
            notes: found.notes || "",
          });
        }
      } catch (error) {
        console.error("Error loading dream:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDream();
  }, [id]);

  const handleFormChange = (updates: Partial<typeof editForm>) => {
    setEditForm((prev) => ({ ...prev, ...updates }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (dream) {
      setEditForm({
        world: dream.world,
        threatLevel: dream.threatLevel,
        timeSystem: dream.timeSystem,
        safetyOverride: dream.safetyOverride,
        exit: dream.exit,
        environments: dream.environments,
        entities: dream.entities,
        dreamTypes: dream.dreamTypes || [],
        notes: dream.notes || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!dream) return;

    setSaving(true);
    try {
      const updated = await updateDreamLog(dream.id, editForm);
      if (updated) {
        setDream(updated);
        setIsEditing(false);
        toast.success("บันทึกการแก้ไขแล้ว");
      } else {
        toast.error("ไม่สามารถบันทึกได้");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (dream && confirm("ลบบันทึกนี้?")) {
      const success = await deleteDreamLog(dream.id);
      if (success) {
        toast.success("ลบเรียบร้อย");
        navigate("/logs");
      } else {
        toast.error("เกิดข้อผิดพลาด");
      }
    }
  };

  const handleExport = () => {
    if (dream) {
      printDreamLog(dream);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
    );
  }

  if (!dream) {
    return (
      <div className="py-4">
        <p className="text-muted-foreground">ไม่พบบันทึก</p>
        <Button asChild variant="link" className="mt-2 p-0">
          <Link to="/logs">กลับไปรายการ</Link>
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(dream.date).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="py-4 space-y-6">
      <AnimatedSection delay={0} duration={400}>
        <DreamDetailHeader
          dreamId={dream.id}
          isEditing={isEditing}
          saving={saving}
          onBack={() => navigate(-1)}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </AnimatedSection>

      {/* Main Info */}
      <AnimatedSection delay={80} duration={400}>
        <div>
          {isEditing ? (
            <DreamWorldEdit
              editForm={editForm}
              onFormChange={handleFormChange}
            />
          ) : (
            <h1 className="text-xl mb-1">{dream.world}</h1>
          )}
          <p className="text-muted-foreground">
            {formattedDate} • {dream.wakeTime}
          </p>
        </div>
      </AnimatedSection>

      {/* Dream Types */}
      {(isEditing || (dream.dreamTypes && dream.dreamTypes.length > 0)) && (
        <AnimatedSection delay={120} duration={400}>
          <div>
            {isEditing ? (
              <DreamTypeSelector
                selectedTypes={editForm.dreamTypes}
                onToggleType={(type) => {
                  handleFormChange({
                    dreamTypes: editForm.dreamTypes.includes(type)
                      ? editForm.dreamTypes.filter((t) => t !== type)
                      : [...editForm.dreamTypes, type],
                  });
                }}
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">ประเภทฝัน</p>
                <div className="flex flex-wrap gap-2">
                  {dream.dreamTypes!.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 text-sm rounded-full bg-amber-100 text-amber-800 border border-amber-200"
                    >
                      {
                        DREAM_TYPE_LABELS[
                          type as keyof typeof DREAM_TYPE_LABELS
                        ]
                      }
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={160} duration={400}>
        <DreamStatsGrid
          dream={dream}
          isEditing={isEditing}
          editForm={editForm}
          onFormChange={handleFormChange}
        />
      </AnimatedSection>

      {/* Environments */}
      <AnimatedSection delay={240} duration={400}>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Environments</p>
          {isEditing ? (
            <DreamEnvironmentsEdit
              editForm={editForm}
              onFormChange={handleFormChange}
            />
          ) : dream.environments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dream.environments.map((env) => (
                <span key={env} className="tag">
                  {env}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </div>
      </AnimatedSection>

      {/* Entities */}
      <AnimatedSection delay={320} duration={400}>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Entities</p>
          {isEditing ? (
            <DreamEntitiesEdit
              editForm={editForm}
              onFormChange={handleFormChange}
            />
          ) : dream.entities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dream.entities.map((entity) => (
                <span key={entity} className="tag-accent">
                  {entity}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </div>
      </AnimatedSection>

      {/* Notes */}
      <AnimatedSection delay={400} duration={400}>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Notes</p>
          {isEditing ? (
            <DreamNotesEdit
              editForm={editForm}
              onFormChange={handleFormChange}
            />
          ) : dream.notes ? (
            <p className="text-sm whitespace-pre-wrap">{dream.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
