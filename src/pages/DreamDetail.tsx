import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDreamLogs, deleteDreamLog, updateDreamLog } from "@/lib/api";
import {
  DreamLog,
  TIME_SYSTEMS,
  SAFETY_OVERRIDES,
  EXIT_TYPES,
} from "@/types/dream";
import { toast } from "sonner";

const threatColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-orange-200 text-orange-900",
  4: "bg-red-100 text-red-800",
  5: "bg-red-200 text-red-900",
};

export default function DreamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<DreamLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    world: "",
    threatLevel: 0 as DreamLog["threatLevel"],
    timeSystem: "unknown" as DreamLog["timeSystem"],
    safetyOverride: "unknown" as DreamLog["safetyOverride"],
    exit: "unknown" as DreamLog["exit"],
    environments: [] as string[],
    entities: [] as string[],
    notes: "",
  });

  useEffect(() => {
    const loadDream = async () => {
      try {
        const dreams = await getDreamLogs();
        const found = dreams.find((d) => d.id === id);
        setDream(found || null);

        // Initialize edit form
        if (found) {
          setEditForm({
            world: found.world,
            threatLevel: found.threatLevel,
            timeSystem: found.timeSystem,
            safetyOverride: found.safetyOverride,
            exit: found.exit,
            environments: found.environments,
            entities: found.entities,
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

  const handleEdit = () => {
    setIsEditing(true);
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono text-muted-foreground">
            {dream.id}
          </span>
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4" />
              </Button>
              <Button size="icon" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" onClick={handleEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Info */}
      <div>
        {isEditing ? (
          <Input
            value={editForm.world}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, world: e.target.value }))
            }
            className="text-xl font-semibold mb-2"
            placeholder="ชื่อโลก"
          />
        ) : (
          <h1 className="text-xl mb-1">{dream.world}</h1>
        )}
        <p className="text-muted-foreground">
          {formattedDate} • {dream.wakeTime}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
          {isEditing ? (
            <Select
              value={String(editForm.threatLevel)}
              onValueChange={(v) =>
                setEditForm((prev) => ({
                  ...prev,
                  threatLevel: Number(v) as DreamLog["threatLevel"],
                }))
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span
              className={`threat-badge text-lg ${threatColors[dream.threatLevel]}`}
            >
              {dream.threatLevel}
            </span>
          )}
        </div>

        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Time System</p>
          {isEditing ? (
            <Select
              value={editForm.timeSystem}
              onValueChange={(v) =>
                setEditForm((prev) => ({
                  ...prev,
                  timeSystem: v as DreamLog["timeSystem"],
                }))
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SYSTEMS.map((ts) => (
                  <SelectItem key={ts} value={ts}>
                    {ts}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{dream.timeSystem}</p>
          )}
        </div>

        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Safety Override</p>
          {isEditing ? (
            <Select
              value={editForm.safetyOverride}
              onValueChange={(v) =>
                setEditForm((prev) => ({
                  ...prev,
                  safetyOverride: v as DreamLog["safetyOverride"],
                }))
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAFETY_OVERRIDES.map((so) => (
                  <SelectItem key={so} value={so}>
                    {so}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{dream.safetyOverride}</p>
          )}
        </div>

        <div className="card-minimal">
          <p className="text-xs text-muted-foreground mb-1">Exit</p>
          {isEditing ? (
            <Select
              value={editForm.exit}
              onValueChange={(v) =>
                setEditForm((prev) => ({
                  ...prev,
                  exit: v as DreamLog["exit"],
                }))
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXIT_TYPES.map((ex) => (
                  <SelectItem key={ex} value={ex}>
                    {ex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-medium">{dream.exit}</p>
          )}
        </div>
      </div>

      {/* Environments */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Environments</p>
        {isEditing ? (
          <Input
            value={editForm.environments.join(", ")}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                environments: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="fog, sea, mountain (คั่นด้วยจุลภาค)"
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

      {/* Entities */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Entities</p>
        {isEditing ? (
          <Input
            value={editForm.entities.join(", ")}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                entities: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            placeholder="Entity1, Entity2 (คั่นด้วยจุลภาค)"
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

      {/* Notes */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Notes</p>
        {isEditing ? (
          <Textarea
            value={editForm.notes}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="min-h-[120px]"
            placeholder="บันทึกเพิ่มเติม..."
          />
        ) : dream.notes ? (
          <p className="text-sm whitespace-pre-wrap">{dream.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">-</p>
        )}
      </div>
    </div>
  );
}
