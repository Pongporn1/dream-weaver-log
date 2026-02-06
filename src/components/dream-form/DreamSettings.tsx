import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIME_SYSTEMS, SAFETY_OVERRIDES, EXIT_TYPES, DreamLog } from "@/types/dream";

interface DreamSettingsProps {
  timeSystem: DreamLog["timeSystem"];
  threatLevel: DreamLog["threatLevel"];
  safetyOverride: DreamLog["safetyOverride"];
  exit: DreamLog["exit"];
  onTimeSystemChange: (value: DreamLog["timeSystem"]) => void;
  onThreatLevelChange: (value: DreamLog["threatLevel"]) => void;
  onSafetyOverrideChange: (value: DreamLog["safetyOverride"]) => void;
  onExitChange: (value: DreamLog["exit"]) => void;
}

export function DreamSettings({
  timeSystem,
  threatLevel,
  safetyOverride,
  exit,
  onTimeSystemChange,
  onThreatLevelChange,
  onSafetyOverrideChange,
  onExitChange,
}: DreamSettingsProps) {
  return (
    <>
      {/* Time System */}
      <div className="space-y-2">
        <Label>ระบบเวลา (Time System)</Label>
        <Select
          value={timeSystem}
          onValueChange={(v) => onTimeSystemChange(v as DreamLog["timeSystem"])}
        >
          <SelectTrigger>
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
      </div>

      {/* Threat Level */}
      <div className="space-y-2">
        <Label>ระดับภัยคุกคาม: {threatLevel}</Label>
        <input
          type="range"
          min="0"
          max="5"
          value={threatLevel}
          onChange={(e) =>
            onThreatLevelChange(Number(e.target.value) as DreamLog["threatLevel"])
          }
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>5</span>
        </div>
      </div>

      {/* Safety Override */}
      <div className="space-y-2">
        <Label>ระบบความปลอดภัย</Label>
        <Select
          value={safetyOverride}
          onValueChange={(v) => onSafetyOverrideChange(v as DreamLog["safetyOverride"])}
        >
          <SelectTrigger>
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
      </div>

      {/* Exit */}
      <div className="space-y-2">
        <Label>การออกจากฝัน</Label>
        <Select
          value={exit}
          onValueChange={(v) => onExitChange(v as DreamLog["exit"])}
        >
          <SelectTrigger>
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
      </div>
    </>
  );
}
