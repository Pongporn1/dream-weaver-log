import { DreamLog } from "@/types/dream";
import {
  DreamThreatEdit,
  DreamTimeSystemEdit,
  DreamSafetyEdit,
  DreamExitEdit,
} from "./DreamEditFields";

const threatColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-orange-200 text-orange-900",
  4: "bg-red-100 text-red-800",
  5: "bg-red-200 text-red-900",
};

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

interface DreamStatsGridProps {
  dream: DreamLog;
  isEditing: boolean;
  editForm: DreamEditFormState;
  onFormChange: (updates: Partial<DreamEditFormState>) => void;
}

export function DreamStatsGrid({ dream, isEditing, editForm, onFormChange }: DreamStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card-minimal">
        <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
        {isEditing ? (
          <DreamThreatEdit editForm={editForm} onFormChange={onFormChange} />
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
          <DreamTimeSystemEdit editForm={editForm} onFormChange={onFormChange} />
        ) : (
          <p className="font-medium">{dream.timeSystem}</p>
        )}
      </div>

      <div className="card-minimal">
        <p className="text-xs text-muted-foreground mb-1">Safety Override</p>
        {isEditing ? (
          <DreamSafetyEdit editForm={editForm} onFormChange={onFormChange} />
        ) : (
          <p className="font-medium">{dream.safetyOverride}</p>
        )}
      </div>

      <div className="card-minimal">
        <p className="text-xs text-muted-foreground mb-1">Exit</p>
        {isEditing ? (
          <DreamExitEdit editForm={editForm} onFormChange={onFormChange} />
        ) : (
          <p className="font-medium">{dream.exit}</p>
        )}
      </div>
    </div>
  );
}
