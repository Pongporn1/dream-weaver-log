import { MoonPhenomenon } from "@/data/moonPhenomena";
import { MoonPhaseInfo } from "@/utils/moonPhases";
import { X, Moon, Sparkles, Star } from "lucide-react";

interface MoonInfoOverlayProps {
  type: "phase" | "phenomenon";
  moonPhase: MoonPhaseInfo;
  phenomenon: MoonPhenomenon | null;
  onClose: () => void;
}

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  normal: { bg: "bg-slate-900/90", border: "border-slate-600", text: "text-slate-300" },
  rare: { bg: "bg-blue-950/90", border: "border-blue-500", text: "text-blue-300" },
  very_rare: { bg: "bg-purple-950/90", border: "border-purple-500", text: "text-purple-300" },
  legendary: { bg: "bg-amber-950/90", border: "border-amber-500", text: "text-amber-300" },
  mythic: { bg: "bg-rose-950/90", border: "border-rose-400", text: "text-rose-300" },
};

const rarityLabels: Record<string, string> = {
  normal: "ปกติ",
  rare: "หายาก",
  very_rare: "หายากมาก",
  legendary: "ตำนาน",
  mythic: "ในนิยาย",
};

export function MoonInfoOverlay({ type, moonPhase, phenomenon, onClose }: MoonInfoOverlayProps) {
  const colors = rarityColors[phenomenon?.rarity || "normal"];

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Content card */}
      <div 
        className={`relative max-w-sm w-full rounded-2xl border-2 ${colors.bg} ${colors.border} p-6 shadow-2xl animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>

        {type === "phase" ? (
          // Moon Phase Info
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-white/10">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{moonPhase.phaseName}</h3>
                <p className="text-sm text-white/70">{moonPhase.phaseNameTh}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">ความสว่าง</p>
                <p className="text-xl font-bold text-white">
                  {Math.round(moonPhase.illumination * 100)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">อายุดวงจันทร์</p>
                <p className="text-xl font-bold text-white">
                  {moonPhase.age.toFixed(1)} <span className="text-sm font-normal">วัน</span>
                </p>
              </div>
            </div>

            {/* Moon Phase Visual */}
            <div className="flex justify-center py-2">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-white/90 shadow-lg" />
                {/* Shadow overlay based on phase */}
                <div 
                  className="absolute inset-0 rounded-full bg-slate-900/90"
                  style={{
                    clipPath: moonPhase.phase < 0.5 
                      ? `inset(0 ${(1 - moonPhase.phase * 2) * 100}% 0 0)`
                      : `inset(0 0 0 ${((moonPhase.phase - 0.5) * 2) * 100}%)`,
                  }}
                />
              </div>
            </div>

            <p className="text-center text-sm text-white/60">
              แตะที่ใดก็ได้เพื่อปิด
            </p>
          </div>
        ) : (
          // Phenomenon Details
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: phenomenon?.uiAccent + "30" }}
              >
                <Sparkles className="w-6 h-6" style={{ color: phenomenon?.uiAccent }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{phenomenon?.name}</h3>
                <p className="text-sm text-white/70">{phenomenon?.nameEn}</p>
              </div>
            </div>

            {/* Rarity Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} border ${colors.border}`}>
              <Star className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-sm font-medium ${colors.text}`}>
                {rarityLabels[phenomenon?.rarity || "normal"]}
              </span>
            </div>

            {/* Subtitle */}
            <p className="text-lg italic text-white/80 border-l-2 pl-3" style={{ borderColor: phenomenon?.uiAccent }}>
              "{phenomenon?.subtitle}"
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">ดาว</p>
                <p className="text-lg font-semibold text-white">
                  {Math.round((phenomenon?.starDensity || 0) * 100)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">เมฆ</p>
                <p className="text-lg font-semibold text-white">
                  {Math.round((phenomenon?.cloudOpacity || 0) * 100)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">ดาวตก</p>
                <p className="text-lg font-semibold text-white">
                  {Math.round((phenomenon?.shootingStarChance || 0) * 100)}%
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">ขนาดดวงจันทร์</p>
                <p className="text-lg font-semibold text-white">
                  {((phenomenon?.moonSize || 1) * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Special Effect */}
            {phenomenon?.specialEffect && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-white/50 mb-1">เอฟเฟกต์พิเศษ</p>
                <p className="text-base font-medium text-white capitalize">
                  {phenomenon.specialEffect}
                  {phenomenon.effectIntensity && (
                    <span className="text-white/60 ml-2">
                      ({Math.round(phenomenon.effectIntensity * 100)}%)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Emotion Tag */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: phenomenon?.uiAccent + "20",
                  color: phenomenon?.uiAccent,
                }}
              >
                #{phenomenon?.emotionTag}
              </span>
            </div>

            <p className="text-center text-sm text-white/60">
              แตะที่ใดก็ได้เพื่อปิด
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
