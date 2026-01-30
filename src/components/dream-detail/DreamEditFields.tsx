import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DreamLog, TIME_SYSTEMS, SAFETY_OVERRIDES, EXIT_TYPES } from "@/types/dream";

interface DreamEditFormState {
  world: string;
  threatLevel: DreamLog["threatLevel"];
  timeSystem: DreamLog["timeSystem"];
  safetyOverride: DreamLog["safetyOverride"];
  exit: DreamLog["exit"];
  environments: string[];
  entities: string[];
  notes: string;
}

interface DreamDetailEditProps {
  editForm: DreamEditFormState;
  onFormChange: (updates: Partial<DreamEditFormState>) => void;
}

export function DreamWorldEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Input
      value={editForm.world}
      onChange={(e) => onFormChange({ world: e.target.value })}
      className="text-xl font-semibold mb-2"
      placeholder="ชื่อโลก"
    />
  );
}

export function DreamThreatEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Select
      value={String(editForm.threatLevel)}
      onValueChange={(v) =>
        onFormChange({ threatLevel: Number(v) as DreamLog["threatLevel"] })
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
  );
}

export function DreamTimeSystemEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Select
      value={editForm.timeSystem}
      onValueChange={(v) =>
        onFormChange({ timeSystem: v as DreamLog["timeSystem"] })
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
  );
}

export function DreamSafetyEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Select
      value={editForm.safetyOverride}
      onValueChange={(v) =>
        onFormChange({ safetyOverride: v as DreamLog["safetyOverride"] })
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
  );
}

export function DreamExitEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Select
      value={editForm.exit}
      onValueChange={(v) => onFormChange({ exit: v as DreamLog["exit"] })}
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
  );
}

export function DreamEnvironmentsEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Input
      value={editForm.environments.join(", ")}
      onChange={(e) =>
        onFormChange({
          environments: e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        })
      }
      placeholder="fog, sea, mountain (คั่นด้วยจุลภาค)"
    />
  );
}

export function DreamEntitiesEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Input
      value={editForm.entities.join(", ")}
      onChange={(e) =>
        onFormChange({
          entities: e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        })
      }
      placeholder="Entity1, Entity2 (คั่นด้วยจุลภาค)"
    />
  );
}

export function DreamNotesEdit({ editForm, onFormChange }: DreamDetailEditProps) {
  return (
    <Textarea
      value={editForm.notes}
      onChange={(e) => onFormChange({ notes: e.target.value })}
      className="min-h-[120px]"
      placeholder="บันทึกเพิ่มเติม..."
    />
  );
}
