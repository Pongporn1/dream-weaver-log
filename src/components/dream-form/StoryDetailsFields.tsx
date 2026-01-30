import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EMOTIONS = [
  { id: "fear", label: "กลัว", emoji: "😨", color: "bg-red-500/20 border-red-500/50 text-red-400" },
  { id: "joy", label: "สุข", emoji: "😊", color: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" },
  { id: "sadness", label: "เศร้า", emoji: "😢", color: "bg-blue-500/20 border-blue-500/50 text-blue-400" },
  { id: "anxiety", label: "กังวล", emoji: "😰", color: "bg-orange-500/20 border-orange-500/50 text-orange-400" },
  { id: "peace", label: "สงบ", emoji: "😌", color: "bg-green-500/20 border-green-500/50 text-green-400" },
  { id: "excitement", label: "ตื่นเต้น", emoji: "🤩", color: "bg-pink-500/20 border-pink-500/50 text-pink-400" },
  { id: "confusion", label: "สับสน", emoji: "😵‍💫", color: "bg-purple-500/20 border-purple-500/50 text-purple-400" },
  { id: "wonder", label: "ทึ่ง", emoji: "🤯", color: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" },
] as const;

const ATMOSPHERE_COLORS = [
  { id: "dark", label: "มืด", gradient: "from-gray-900 to-gray-700" },
  { id: "golden", label: "ทอง", gradient: "from-amber-500 to-orange-600" },
  { id: "blue", label: "ฟ้า", gradient: "from-blue-400 to-indigo-600" },
  { id: "purple", label: "ม่วง", gradient: "from-purple-500 to-pink-600" },
  { id: "green", label: "เขียว", gradient: "from-emerald-400 to-teal-600" },
  { id: "red", label: "แดง", gradient: "from-red-500 to-rose-700" },
  { id: "white", label: "ขาว", gradient: "from-gray-100 to-gray-300" },
  { id: "rainbow", label: "รุ้ง", gradient: "from-red-400 via-yellow-400 to-blue-500" },
] as const;

interface StoryDetailsFieldsProps {
  storySummary: string;
  onStorySummaryChange: (value: string) => void;
  emotions: string[];
  onEmotionsChange: (value: string[]) => void;
  atmosphereColors: string[];
  onAtmosphereColorsChange: (value: string[]) => void;
  lucidityLevel: number;
  onLucidityLevelChange: (value: number) => void;
}

export function StoryDetailsFields({
  storySummary,
  onStorySummaryChange,
  emotions,
  onEmotionsChange,
  atmosphereColors,
  onAtmosphereColorsChange,
  lucidityLevel,
  onLucidityLevelChange,
}: StoryDetailsFieldsProps) {
  const toggleEmotion = (emotionId: string) => {
    if (emotions.includes(emotionId)) {
      onEmotionsChange(emotions.filter((e) => e !== emotionId));
    } else {
      onEmotionsChange([...emotions, emotionId]);
    }
  };

  const toggleColor = (colorId: string) => {
    if (atmosphereColors.includes(colorId)) {
      onAtmosphereColorsChange(atmosphereColors.filter((c) => c !== colorId));
    } else {
      onAtmosphereColorsChange([...atmosphereColors, colorId]);
    }
  };

  const getLucidityLabel = (level: number) => {
    if (level <= 1) return "ไม่รู้ตัวเลย";
    if (level <= 3) return "รู้ตัวเล็กน้อย";
    if (level <= 5) return "รู้ตัวบ้าง";
    if (level <= 7) return "รู้ตัวค่อนข้างดี";
    if (level <= 9) return "รู้ตัวมาก";
    return "ควบคุมได้เต็มที่";
  };

  return (
    <div className="space-y-6">
      {/* Story Summary */}
      <div className="space-y-2">
        <Label htmlFor="storySummary" className="text-base font-medium flex items-center gap-2">
          📖 เรื่องย่อความฝัน
        </Label>
        <Textarea
          id="storySummary"
          placeholder="เล่าเรื่องย่อความฝันของคุณ... เกิดอะไรขึ้นบ้าง? มีใครบ้าง? จบลงอย่างไร?"
          value={storySummary}
          onChange={(e) => onStorySummaryChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          ยิ่งเขียนละเอียด ปกหนังสือจะยิ่งสวยและตรงตามความฝัน
        </p>
      </div>

      {/* Emotions */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          💭 อารมณ์ที่รู้สึก
        </Label>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.id}
              type="button"
              onClick={() => toggleEmotion(emotion.id)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
                emotions.includes(emotion.id)
                  ? emotion.color + " border-2 scale-105"
                  : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="mr-1">{emotion.emoji}</span>
              {emotion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Atmosphere Colors */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          🎨 สีและบรรยากาศ
        </Label>
        <div className="flex flex-wrap gap-2">
          {ATMOSPHERE_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => toggleColor(color.id)}
              className={cn(
                "relative overflow-hidden px-4 py-2 rounded-lg text-sm font-medium transition-all",
                atmosphereColors.includes(color.id)
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", color.gradient)} />
              <span className="relative text-white drop-shadow-md">{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lucidity Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium flex items-center gap-2">
            ✨ ระดับความชัดเจน (Lucidity)
          </Label>
          <Badge variant="secondary" className="text-sm">
            {lucidityLevel}/10 - {getLucidityLabel(lucidityLevel)}
          </Badge>
        </div>
        <Slider
          value={[lucidityLevel]}
          onValueChange={([value]) => onLucidityLevelChange(value)}
          min={0}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ไม่รู้ตัวเลย</span>
          <span>ควบคุมได้เต็มที่</span>
        </div>
      </div>
    </div>
  );
}

export { EMOTIONS, ATMOSPHERE_COLORS };
