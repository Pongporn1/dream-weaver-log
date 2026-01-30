import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AISuggestionsPreview } from "./AISuggestionsPreview";
import { AnimatedSection } from "./AnimatedSection";
import { suggestTags, addDreamLog, getDreamLogs } from "@/lib/api";
import { DreamLog } from "@/types/dream";
import { toast } from "sonner";

export interface AISuggestions {
  world: string;
  timeSystem: string;
  environments: string[];
  entities: string[];
  threatLevel: number;
  safetyOverride: string;
  exit: string;
}

interface QuickDreamEntryProps {
  existingWorlds: string[];
  existingEntities: string[];
  onDreamSaved: (dreams: DreamLog[]) => void;
}

export function QuickDreamEntry({
  existingWorlds,
  existingEntities,
  onDreamSaved,
}: QuickDreamEntryProps) {
  const [quickNote, setQuickNote] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingSuggestions, setEditingSuggestions] = useState(false);

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
        ["fog", "sea", "mountain", "city", "tunnel", "rain", "night", "sunset", "forest", "building"]
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
        timeSystem: (aiSuggestions.timeSystem as DreamLog["timeSystem"]) || "unknown",
        environments: aiSuggestions.environments || [],
        entities: aiSuggestions.entities || [],
        threatLevel: (aiSuggestions.threatLevel as DreamLog["threatLevel"]) || 0,
        safetyOverride: (aiSuggestions.safetyOverride as DreamLog["safetyOverride"]) || "unknown",
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
        onDreamSaved(dreams.slice(0, 5));
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

  const handleCancel = () => {
    setShowSuggestions(false);
    setAiSuggestions(null);
    setEditingSuggestions(false);
  };

  const updateSuggestion = (field: string, value: string | string[] | number) => {
    setAiSuggestions((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <AnimatedSection delay={100} duration={450}>
      <div className="space-y-3">
        <Textarea
          placeholder="เล่าความฝันสั้นๆ... "
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={showSuggestions}
        />

        {showSuggestions && aiSuggestions && (
          <AISuggestionsPreview
            suggestions={aiSuggestions}
            editing={editingSuggestions}
            analyzing={analyzing}
            onToggleEdit={() => setEditingSuggestions(!editingSuggestions)}
            onConfirm={handleConfirmSave}
            onCancel={handleCancel}
            onUpdate={updateSuggestion}
          />
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
    </AnimatedSection>
  );
}
