import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Library,
  Moon,
  Sparkles,
  Loader2,
  Edit2,
  Check,
  X,
  Home as HomeIcon,
  Book,
  BarChart3,
  Info,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DreamCard } from "@/components/DreamCard";
import { AnimatedProfileHeader } from "@/components/AnimatedProfileHeader";
import {
  getDreamLogs,
  getWorlds,
  getEntities,
  suggestTags,
  addDreamLog,
} from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "sonner";

import { BottomNavigation } from "@/components/BottomNavigation";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recentDreams, setRecentDreams] = useState<DreamLog[]>([]);
  const [quickNote, setQuickNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [existingWorlds, setExistingWorlds] = useState<string[]>([]);
  const [existingEntities, setExistingEntities] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<{
    world: string;
    timeSystem: string;
    environments: string[];
    entities: string[];
    threatLevel: number;
    safetyOverride: string;
    exit: string;
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingSuggestions, setEditingSuggestions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
    };
    loadData();
  }, []);

  const handleAnalyze = async () => {
    if (!quickNote.trim()) {
      toast.error("เขียนอะไรสักหน่อยก่อนนะ");
      return;
    }

    setAnalyzing(true);
    try {
      const suggestions = await suggestTags(
        quickNote,
        existingWorlds,
        existingEntities,
        [
          "fog",
          "sea",
          "mountain",
          "city",
          "tunnel",
          "rain",
          "night",
          "sunset",
          "forest",
          "building",
        ],
      );

      setAiSuggestions(suggestions);
      setShowSuggestions(true);
      toast.success("วิเคราะห์เสร็จแล้ว! ตรวจสอบและบันทึกได้เลย");
    } catch (error) {
      console.error("Error analyzing:", error);
      toast.error("เกิดข้อผิดพลาดในการวิเคราะห์");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!aiSuggestions) return;

    setAnalyzing(true);
    try {
      const today = new Date();
      const newLog = await addDreamLog({
        date: today.toISOString().split("T")[0],
        wakeTime: today.toTimeString().slice(0, 5),
        world: aiSuggestions.world || "Unknown",
        timeSystem:
          (aiSuggestions.timeSystem as DreamLog["timeSystem"]) || "unknown",
        environments: aiSuggestions.environments || [],
        entities: aiSuggestions.entities || [],
        threatLevel:
          (aiSuggestions.threatLevel as DreamLog["threatLevel"]) || 0,
        safetyOverride:
          (aiSuggestions.safetyOverride as DreamLog["safetyOverride"]) ||
          "unknown",
        exit: (aiSuggestions.exit as DreamLog["exit"]) || "unknown",
        notes: quickNote,
      });

      if (newLog) {
        toast.success("บันทึกความฝันแล้ว! 🌙", {
          description: `โลก: ${aiSuggestions.world} | Threat: ${aiSuggestions.threatLevel}`,
        });
        setQuickNote("");
        setAiSuggestions(null);
        setShowSuggestions(false);
        setEditingSuggestions(false);
        const dreams = await getDreamLogs();
        setRecentDreams(dreams.slice(0, 5));
      } else {
        toast.error("ไม่สามารถบันทึกได้");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setAnalyzing(false);
    }
  };

  const updateSuggestion = (
    field: string,
    value: string | string[] | number,
  ) => {
    setAiSuggestions((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Animated Header */}
      <AnimatedProfileHeader />

      {/* Main Content */}
      <div className="flex-1">
        <div className="space-y-8 py-4 container-app">
          {/* Greeting */}
          <div className="space-y-2">
            <h1 className="text-2xl">สวัสดีบอน</h1>
            <p className="text-muted-foreground">วันนี้อยากเล่าเรื่องอะไรหรอ</p>
          </div>

          {/* Quick Entry */}
          <div className="space-y-3">
            <Textarea
              placeholder="เล่าความฝันสั้นๆ... "
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={showSuggestions}
            />

            {/* AI Suggestions Preview */}
            {showSuggestions && aiSuggestions && (
              <div className="card-minimal space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      AI วิเคราะห์แล้ว
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSuggestions(!editingSuggestions)}
                  >
                    {editingSuggestions ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">โลก: </span>
                    {editingSuggestions ? (
                      <Input
                        value={aiSuggestions.world}
                        onChange={(e) =>
                          updateSuggestion("world", e.target.value)
                        }
                        className="mt-1 h-8"
                      />
                    ) : (
                      <Badge variant="secondary">{aiSuggestions.world}</Badge>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground">ระดับภัย: </span>
                    <Badge
                      variant={
                        aiSuggestions.threatLevel >= 3
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      Level {aiSuggestions.threatLevel}
                    </Badge>
                  </div>

                  {aiSuggestions.entities?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Entities: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiSuggestions.entities.map((e: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.environments?.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">
                        Environments:{" "}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiSuggestions.environments.map(
                          (e: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {e}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmSave}
                    disabled={analyzing}
                    className="flex-1 gap-2"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        บันทึกเลย
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSuggestions(false);
                      setAiSuggestions(null);
                      setEditingSuggestions(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {!showSuggestions && (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !quickNote.trim()}
                className="w-full gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    วิเคราะห์
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 h-12"
            >
              <Link to="/logs/new">
                <Plus className="w-5 h-5" />
                <span className="flex-1 text-left">
                  บันทึกฝันใหม่ (กรอกเอง)
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 h-12"
            >
              <Link to="/library">
                <Library className="w-5 h-5" />
                <span className="flex-1 text-left">ห้องสมุดความฝัน</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 h-12"
            >
              <Link to="/logs">
                <Moon className="w-5 h-5" />
                <span className="flex-1 text-left">ดูบันทึกทั้งหมด</span>
              </Link>
            </Button>
          </div>

          {/* Recent Dreams */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              กำลังโหลด...
            </div>
          ) : recentDreams.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">บันทึกล่าสุด</h2>
                <Link
                  to="/logs"
                  className="text-sm text-primary hover:underline"
                >
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="space-y-2">
                {recentDreams.map((dream) => (
                  <DreamCard key={dream.id} dream={dream} compact />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>ยังไม่มีบันทึก</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/logs/new">สร้างบันทึกแรก</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
