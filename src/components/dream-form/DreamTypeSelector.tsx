import { Label } from "@/components/ui/label";
import { DREAM_TYPES, DREAM_TYPE_LABELS } from "@/types/dream";
import { Sparkles, Skull, Repeat, Eye } from "lucide-react";

type DreamType = (typeof DREAM_TYPES)[number];

interface DreamTypeSelectorProps {
  selectedTypes: string[];
  onToggleType: (type: string) => void;
}

const DREAM_TYPE_ICONS: Record<DreamType, React.ReactNode> = {
  lucid: <Sparkles className="w-4 h-4" />,
  nightmare: <Skull className="w-4 h-4" />,
  recurring: <Repeat className="w-4 h-4" />,
  prophetic: <Eye className="w-4 h-4" />,
};

const DREAM_TYPE_COLORS: Record<
  DreamType,
  {
    bg: string;
    border: string;
    text: string;
    activeBg: string;
    activeBorder: string;
    activeText: string;
  }
> = {
  lucid: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    activeBg: "bg-purple-600",
    activeBorder: "border-purple-700",
    activeText: "text-white",
  },
  nightmare: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    activeBg: "bg-red-600",
    activeBorder: "border-red-700",
    activeText: "text-white",
  },
  recurring: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    activeBg: "bg-amber-600",
    activeBorder: "border-amber-700",
    activeText: "text-white",
  },
  prophetic: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    activeBg: "bg-cyan-600",
    activeBorder: "border-cyan-700",
    activeText: "text-white",
  },
};

export function DreamTypeSelector({
  selectedTypes,
  onToggleType,
}: DreamTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>ประเภทฝัน</Label>
      <p className="text-xs text-muted-foreground">
        เลือกได้หลายประเภท (ถ้าเข้าข่าย)
      </p>
      <div className="flex flex-wrap gap-2">
        {DREAM_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type);
          const colors = DREAM_TYPE_COLORS[type];

          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleType(type)}
              className={`
                px-3 py-2 rounded-md border transition-all
                flex items-center gap-2 text-sm font-medium
                ${
                  isSelected
                    ? `${colors.activeBg} ${colors.activeBorder} ${colors.activeText}`
                    : `${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`
                }
              `}
            >
              {DREAM_TYPE_ICONS[type]}
              {DREAM_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
