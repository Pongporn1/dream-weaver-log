import { useEffect, useMemo, useState } from "react";
import type { DreamLog, ThreatEntry } from "@/types/dream";
import { THREAT_ENTRY_LEVELS, THREAT_ENTRY_LEVEL_LABELS } from "@/types/dream";
import {
  AlertTriangle,
  Clock3,
  Activity,
  Pencil,
  Save,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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

type ThreatSortMode =
  | "level_desc"
  | "recent_desc"
  | "usage_desc"
  | "name_asc";

const THREAT_PAGE_SIZE = 12;

const getLevelTheme = (level: ThreatEntry["level"]) => {
  if (level >= 7) {
    return {
      card:
        "border-violet-400/50 bg-gradient-to-br from-violet-500/12 via-fuchsia-500/8 to-background/95 shadow-[0_14px_34px_-24px_rgba(217,70,239,0.9)]",
      accent: "from-violet-400 via-fuchsia-400 to-rose-400",
      badge: "border-violet-400/45 bg-violet-500/20 text-violet-200",
      stat: "border-violet-400/25 bg-violet-500/10",
      response: "border-violet-400/35 bg-violet-500/10 text-violet-100/95",
      orb: "bg-violet-500/25",
    };
  }

  if (level >= 6) {
    return {
      card:
        "border-red-400/45 bg-gradient-to-br from-red-500/12 via-orange-500/8 to-background/95 shadow-[0_14px_34px_-24px_rgba(239,68,68,0.9)]",
      accent: "from-red-400 via-orange-300 to-amber-300",
      badge: "border-red-400/45 bg-red-500/20 text-red-200",
      stat: "border-red-400/25 bg-red-500/10",
      response: "border-red-400/35 bg-red-500/10 text-red-100/95",
      orb: "bg-red-500/20",
    };
  }

  if (level >= 5) {
    return {
      card:
        "border-rose-400/40 bg-gradient-to-br from-rose-500/10 via-red-500/6 to-background/95 shadow-[0_12px_28px_-24px_rgba(251,113,133,0.8)]",
      accent: "from-rose-400 via-red-300 to-orange-300",
      badge: "border-rose-400/40 bg-rose-500/15 text-rose-200",
      stat: "border-rose-400/25 bg-rose-500/8",
      response: "border-rose-400/30 bg-rose-500/8 text-rose-100/95",
      orb: "bg-rose-500/15",
    };
  }

  if (level >= 4) {
    return {
      card:
        "border-orange-400/40 bg-gradient-to-br from-orange-500/10 via-amber-500/8 to-background/95 shadow-[0_10px_26px_-22px_rgba(251,146,60,0.8)]",
      accent: "from-orange-300 via-amber-300 to-yellow-300",
      badge: "border-orange-400/40 bg-orange-500/15 text-orange-200",
      stat: "border-orange-400/20 bg-orange-500/8",
      response: "border-orange-400/30 bg-orange-500/8 text-orange-100/95",
      orb: "bg-orange-500/15",
    };
  }

  if (level >= 3) {
    return {
      card:
        "border-amber-400/35 bg-gradient-to-br from-amber-500/8 via-yellow-500/6 to-background/95 shadow-[0_8px_22px_-20px_rgba(245,158,11,0.7)]",
      accent: "from-amber-300 via-yellow-300 to-lime-300",
      badge: "border-amber-400/35 bg-amber-500/12 text-amber-200",
      stat: "border-amber-400/20 bg-amber-500/8",
      response: "border-amber-400/25 bg-amber-500/8 text-amber-100/95",
      orb: "bg-amber-500/15",
    };
  }

  return {
    card:
      "border-border/70 bg-gradient-to-br from-background/95 via-background/90 to-background/80 shadow-[0_8px_20px_-20px_rgba(15,23,42,0.9)]",
    accent: "from-slate-300/50 via-slate-400/40 to-slate-300/50",
    badge: "border-border/70 bg-background/75 text-foreground/85",
    stat: "border-border/70 bg-background/65",
    response: "border-border/70 bg-background/60 text-foreground/85",
    orb: "bg-slate-400/10",
  };
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
    ability: "",
    countermeasure: "",
    summonMedium: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortMode, setSortMode] = useState<ThreatSortMode>("level_desc");
  const [visibleCount, setVisibleCount] = useState(THREAT_PAGE_SIZE);

  const baseProfiles = useMemo(() => {
    const dreamById = new Map(dreams.map((dream) => [dream.id, dream]));

    return threats.map((threat) => {
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
  }, [dreams, threats]);

  const profiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = baseProfiles.filter((profile) => {
      if (query) {
        const inName = profile.threat.name.toLowerCase().includes(query);
        const inAbility = (profile.threat.ability || profile.threat.response || "")
          .toLowerCase()
          .includes(query);
        const inCountermeasure = (profile.threat.countermeasure || "")
          .toLowerCase()
          .includes(query);
        const inSummonMedium = (profile.threat.summonMedium || "")
          .toLowerCase()
          .includes(query);
        if (!inName && !inAbility && !inCountermeasure && !inSummonMedium) {
          return false;
        }
      }

      if (levelFilter === "5+") return profile.threat.level >= 5;
      if (levelFilter !== "all") return profile.threat.level === Number(levelFilter);
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortMode === "usage_desc") {
        if (b.appearances !== a.appearances) return b.appearances - a.appearances;
        if (b.threat.level !== a.threat.level) return b.threat.level - a.threat.level;
        return a.threat.name.localeCompare(b.threat.name, "th");
      }

      if (sortMode === "recent_desc") {
        const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
        const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
        if (b.threat.level !== a.threat.level) return b.threat.level - a.threat.level;
        return a.threat.name.localeCompare(b.threat.name, "th");
      }

      if (sortMode === "name_asc") {
        return a.threat.name.localeCompare(b.threat.name, "th");
      }

      if (b.threat.level !== a.threat.level) return b.threat.level - a.threat.level;
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      return a.threat.name.localeCompare(b.threat.name, "th");
    });
  }, [baseProfiles, levelFilter, searchQuery, sortMode]);

  const canManageLargeList = compact && typeof maxItems !== "number";

  useEffect(() => {
    if (canManageLargeList) {
      setVisibleCount(THREAT_PAGE_SIZE);
    }
  }, [canManageLargeList, levelFilter, searchQuery, sortMode]);

  const visibleProfiles = useMemo(() => {
    if (typeof maxItems === "number") {
      return profiles.slice(0, maxItems);
    }

    if (!canManageLargeList) {
      return profiles;
    }

    return profiles.slice(0, visibleCount);
  }, [canManageLargeList, maxItems, profiles, visibleCount]);

  const hasMore = canManageLargeList && visibleCount < profiles.length;
  const hasFilters =
    searchQuery.trim().length > 0 || levelFilter !== "all" || sortMode !== "level_desc";

  const canEdit = editable && Boolean(onThreatUpdate);

  const startEditing = (threat: ThreatEntry) => {
    setEditingThreatId(threat.id);
    setDraft({
      name: threat.name,
      level: String(threat.level),
      ability: threat.ability || threat.response || "",
      countermeasure: threat.countermeasure || "",
      summonMedium: threat.summonMedium || "",
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
        ability: draft.ability.trim() || undefined,
        countermeasure: draft.countermeasure.trim() || undefined,
        summonMedium: draft.summonMedium.trim() || undefined,
      });

      if (updated) {
        setEditingThreatId(null);
      }
    } finally {
      setSaving(false);
    }
  };

  if (baseProfiles.length === 0) {
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

      {canManageLargeList && (
        <div className="sticky top-0 z-20 rounded-xl border border-border/60 bg-background/85 p-2.5 backdrop-blur-sm">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ค้นหา threat, ความสามารถ, วิธีรับมือ, สื่อกลาง..."
                className="h-8 border-input/75 bg-background/90 pl-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-8 border-input/75 bg-background/90 text-xs">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <SelectValue placeholder="ระดับ" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  <SelectItem value="all">ทุกระดับ</SelectItem>
                  <SelectItem value="5+">Level 5+</SelectItem>
                  {[7, 6, 5, 4, 3, 2, 1, 0].map((level) => (
                    <SelectItem key={level} value={String(level)}>
                      {THREAT_ENTRY_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortMode}
                onValueChange={(value) => setSortMode(value as ThreatSortMode)}
              >
                <SelectTrigger className="h-8 border-input/75 bg-background/90 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  <SelectItem value="level_desc">เรียงตามระดับภัย</SelectItem>
                  <SelectItem value="recent_desc">เรียงตามล่าสุด</SelectItem>
                  <SelectItem value="usage_desc">เรียงตามความถี่</SelectItem>
                  <SelectItem value="name_asc">เรียงตามชื่อ A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              แสดง {visibleProfiles.length} จาก {profiles.length} threats
            </p>
            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setLevelFilter("all");
                  setSortMode("level_desc");
                }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        </div>
      )}

      {visibleProfiles.length === 0 ? (
        <div className="card-minimal py-10 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p>ไม่พบ threat ตามตัวกรองที่เลือก</p>
        </div>
      ) : (
      <div
        className={cn(
          "grid gap-3",
          compact ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {visibleProfiles.map((profile) => {
          const isEditing = editingThreatId === profile.threat.id;
          const theme = getLevelTheme(profile.threat.level);
          const abilityText =
            profile.threat.ability?.trim() || profile.threat.response?.trim() || "";
          const countermeasureText = profile.threat.countermeasure?.trim() || "";
          const summonMediumText = profile.threat.summonMedium?.trim() || "";
          const hasDetails =
            abilityText.length > 0 ||
            countermeasureText.length > 0 ||
            summonMediumText.length > 0;

          return (
            <article
              key={profile.threat.id}
              className={cn(
                "card-minimal group relative isolate h-full overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_-24px_rgba(0,0,0,0.85)]",
                theme.card,
                compact ? "space-y-3 p-3 min-h-[248px]" : "space-y-3.5",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r",
                  theme.accent,
                )}
              />
              <div
                className={cn(
                  "pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-3xl",
                  theme.orb,
                )}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.08),transparent_36%)]" />

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
                    <div className="relative overflow-hidden rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                      <div
                        className={cn(
                          "pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-full bg-gradient-to-b",
                          theme.accent,
                        )}
                      />
                      <p className="pl-3 text-[9px] font-medium uppercase tracking-[0.14em] text-foreground/55">
                        Threat Entity
                      </p>
                      <h3
                        className={cn(
                          "pl-3 font-black tracking-tight text-foreground drop-shadow-[0_1px_0_rgba(0,0,0,0.55)]",
                          compact
                            ? "line-clamp-2 text-[18px] leading-5"
                            : "line-clamp-2 text-xl leading-6",
                        )}
                      >
                        {profile.threat.name}
                      </h3>
                    </div>
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
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={cn("border", theme.badge)}>
                        <Activity className="mr-1 h-3 w-3" />
                        <span className="truncate">
                          {THREAT_ENTRY_LEVEL_LABELS[profile.threat.level]}
                        </span>
                      </Badge>
                      {profile.threat.level >= 6 && (
                        <Badge
                          variant="outline"
                          className="border-fuchsia-400/35 bg-fuchsia-500/15 text-fuchsia-200"
                        >
                          Apex
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {canEdit && !isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 h-9 w-9 shrink-0 rounded-full border border-white/20 bg-background/55 text-foreground/80 backdrop-blur-sm hover:scale-105 hover:bg-background/80 hover:text-foreground"
                    onClick={() => startEditing(profile.threat)}
                    disabled={saving}
                    title="แก้ไข threat"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={cn("rounded-xl border px-3 py-2.5", theme.stat)}>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-foreground/60">
                    ระดับภัย
                  </p>
                  <p className="mt-1 text-lg font-black leading-none text-foreground">
                    {profile.threat.level}
                  </p>
                </div>
                <div className={cn("rounded-xl border px-3 py-2.5", theme.stat)}>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-foreground/60">
                    ล่าสุด
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[12px] font-medium leading-none text-foreground/85">
                    <Clock3 className="h-3.5 w-3.5 text-primary" />
                    {profile.lastSeen
                      ? format(new Date(profile.lastSeen), "d MMM yyyy", {
                          locale: th,
                        })
                      : "ยังไม่เชื่อมกับบันทึก"}
                  </p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 border-t border-border/70 pt-2">
                  <Textarea
                    className="min-h-[80px] rounded-xl border-input/80 bg-background/90 text-foreground placeholder:text-muted-foreground"
                    value={draft.ability}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        ability: event.target.value,
                      }))
                    }
                    placeholder="ความสามารถ"
                  />
                  <Textarea
                    className="min-h-[80px] rounded-xl border-input/80 bg-background/90 text-foreground placeholder:text-muted-foreground"
                    value={draft.countermeasure}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        countermeasure: event.target.value,
                      }))
                    }
                    placeholder="วิธีรับมือ"
                  />
                  <Input
                    className="h-9 rounded-xl border-input/80 bg-background/90 text-foreground placeholder:text-muted-foreground"
                    value={draft.summonMedium}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        summonMedium: event.target.value,
                      }))
                    }
                    placeholder="สื่อกลางในการอัญเชิญ"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => void saveThreat(profile.threat.id)}
                      disabled={saving || !draft.name.trim()}
                    >
                      <Save className="mr-1 h-3.5 w-3.5" />
                      {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              ) : hasDetails ? (
                <div className="space-y-2">
                  {abilityText && (
                    <div className={cn("rounded-xl border px-3 py-3", theme.response)}>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-foreground/60">
                        ความสามารถ
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-foreground/90",
                          compact ? "line-clamp-4 text-xs leading-relaxed" : "line-clamp-5 text-sm",
                        )}
                      >
                        {abilityText}
                      </p>
                    </div>
                  )}
                  {countermeasureText && (
                    <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-3 text-emerald-100/95">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-emerald-200/75">
                        วิธีรับมือ
                      </p>
                      <p
                        className={cn(
                          "mt-1",
                          compact ? "line-clamp-4 text-xs leading-relaxed" : "line-clamp-5 text-sm",
                        )}
                      >
                        {countermeasureText}
                      </p>
                    </div>
                  )}
                  {summonMediumText && (
                    <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-3 text-cyan-100/95">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-cyan-200/75">
                        สื่อกลางในการอัญเชิญ
                      </p>
                      <p className={cn("mt-1", compact ? "text-xs leading-relaxed" : "text-sm")}>
                        {summonMediumText}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/65 bg-background/50 px-3 py-3">
                  <p className={cn("text-foreground/60", compact ? "text-xs" : "text-sm")}>
                    ยังไม่มีรายละเอียด threat
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setVisibleCount((prev) => prev + THREAT_PAGE_SIZE)}
          >
            โหลดเพิ่มอีก {Math.min(THREAT_PAGE_SIZE, profiles.length - visibleCount)}
          </Button>
        </div>
      )}
    </div>
  );
}
