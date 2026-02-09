import { useMemo, useState } from "react";
import type { DreamLog, ThreatEntry } from "@/types/dream";
import { THREAT_ENTRY_LEVELS, THREAT_ENTRY_LEVEL_LABELS } from "@/types/dream";
import { AlertTriangle, Clock3, Activity, Pencil, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ThreatSectionProps {
  threats: ThreatEntry[];
  dreams: DreamLog[];
  compact?: boolean;
  showHeader?: boolean;
  maxItems?: number;
  editable?: boolean;
  onThreatUpdate?: (
    id: string,
    updates: Partial<Omit<ThreatEntry, "id" | "dreamIds">>,
  ) => Promise<boolean>;
}

interface ThreatProfile {
  threat: ThreatEntry;
  appearances: number;
  lastSeen: string | null;
}

const getLevelClass = (level: ThreatEntry["level"]) => {
  if (level >= 7) return "border-violet-500/45 bg-violet-500/15 text-violet-300";
  if (level >= 6) return "border-red-500/45 bg-red-500/15 text-red-300";
  if (level >= 4) return "border-orange-500/45 bg-orange-500/15 text-orange-300";
  if (level >= 3) return "border-amber-500/45 bg-amber-500/15 text-amber-300";
  return "border-border/70 bg-background/70 text-foreground/80";
};

export function ThreatSection({
  threats,
  dreams,
  compact = false,
  showHeader = true,
  maxItems,
  editable = false,
  onThreatUpdate,
}: ThreatSectionProps) {
  const [editingThreatId, setEditingThreatId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    level: "3",
    response: "",
  });

  const profiles = useMemo(() => {
    const dreamById = new Map(dreams.map((dream) => [dream.id, dream]));

    const result: ThreatProfile[] = threats.map((threat) => {
      const relatedDreams = threat.dreamIds
        .map((dreamId) => dreamById.get(dreamId))
        .filter((dream): dream is DreamLog => Boolean(dream));

      const lastSeen =
        relatedDreams.length > 0
          ? relatedDreams
              .map((dream) => dream.date)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null;

      return {
        threat,
        appearances: relatedDreams.length,
        lastSeen,
      };
    });

    const sorted = result.sort((a, b) => {
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      if (b.threat.level !== a.threat.level) return b.threat.level - a.threat.level;
      return a.threat.name.localeCompare(b.threat.name, "th");
    });

    return typeof maxItems === "number" ? sorted.slice(0, maxItems) : sorted;
  }, [dreams, maxItems, threats]);

  const canEdit = editable && Boolean(onThreatUpdate);

  const startEditing = (threat: ThreatEntry) => {
    setEditingThreatId(threat.id);
    setDraft({
      name: threat.name,
      level: String(threat.level),
      response: threat.response || "",
    });
  };

  const cancelEditing = () => {
    setEditingThreatId(null);
    setSaving(false);
  };

  const saveThreat = async (threatId: string) => {
    if (!onThreatUpdate) return;

    const name = draft.name.trim();
    if (!name) return;

    setSaving(true);
    try {
      const updated = await onThreatUpdate(threatId, {
        name,
        level: Number(draft.level) as ThreatEntry["level"],
        response: draft.response.trim() || undefined,
      });

      if (updated) {
        setEditingThreatId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="card-minimal py-10 text-center text-muted-foreground">
        <AlertTriangle className="mx-auto mb-3 h-10 w-10 opacity-50" />
        <p>ยังไม่มี threat ในระบบ</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {showHeader && (
        <div className="flex items-center gap-2 px-1">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Threat Archive</h2>
        </div>
      )}

      <div
        className={cn(
          "grid gap-3",
          compact ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {profiles.map((profile) => {
          const isEditing = editingThreatId === profile.threat.id;

          return (
            <article
              key={profile.threat.id}
              className={cn(
                "card-minimal border border-border/70 bg-card/90 backdrop-blur-sm h-full",
                compact ? "space-y-2 p-3 min-h-[210px]" : "space-y-3",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="h-9 border-input/80 bg-background/90 text-foreground"
                      placeholder="ชื่อ threat"
                    />
                  ) : (
                    <h3
                      className={cn(
                        "truncate font-semibold",
                        compact ? "text-sm" : "text-base",
                      )}
                    >
                      {profile.threat.name}
                    </h3>
                  )}

                  {isEditing ? (
                    <div className="mt-2">
                      <Select
                        value={draft.level}
                        onValueChange={(value) =>
                          setDraft((prev) => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger className="h-9 border-input/80 bg-background/90 text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-popover text-popover-foreground">
                          {THREAT_ENTRY_LEVELS.map((level) => (
                            <SelectItem key={level} value={String(level)}>
                              {THREAT_ENTRY_LEVEL_LABELS[level]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`mt-2 border ${getLevelClass(profile.threat.level)}`}
                    >
                      <Activity className="mr-1 h-3 w-3" />
                      {THREAT_ENTRY_LEVEL_LABELS[profile.threat.level]}
                    </Badge>
                  )}
                </div>

                {canEdit && !isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground/75 hover:text-foreground"
                    onClick={() => startEditing(profile.threat)}
                    disabled={saving}
                    title="แก้ไข threat"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="outline"
                  className="border-border/70 bg-background/70 text-foreground/85"
                >
                  พบในบันทึก {profile.appearances}
                </Badge>
                <Badge
                  variant="outline"
                  className={`border ${getLevelClass(profile.threat.level)}`}
                >
                  ระดับ {profile.threat.level}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-foreground/75">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
                {profile.lastSeen
                  ? `ล่าสุด: ${format(new Date(profile.lastSeen), "d MMM yyyy", {
                      locale: th,
                    })}`
                  : "ยังไม่ถูกใช้ในบันทึกฝัน"}
              </div>

              {isEditing ? (
                <div className="space-y-2 border-t border-border/70 pt-2">
                  <Textarea
                    className="min-h-[72px] border-input/80 bg-background/90 text-foreground placeholder:text-muted-foreground"
                    value={draft.response}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        response: event.target.value,
                      }))
                    }
                    placeholder="ความสามารถ / วิธีรับมือ"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void saveThreat(profile.threat.id)}
                      disabled={saving || !draft.name.trim()}
                    >
                      <Save className="mr-1 h-3.5 w-3.5" />
                      {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : profile.threat.response ? (
                <p
                  className={cn(
                    "border-t border-border/70 pt-2 text-foreground/80",
                    compact ? "line-clamp-4 text-xs leading-relaxed" : "text-sm",
                  )}
                >
                  ความสามารถ/วิธีรับมือ: {profile.threat.response}
                </p>
              ) : (
                <p
                  className={cn(
                    "border-t border-border/70 pt-2 text-foreground/60",
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  ไม่มีคำอธิบาย threat
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
