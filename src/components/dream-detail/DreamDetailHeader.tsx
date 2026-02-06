import { ArrowLeft, Trash2, Edit2, Save, X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DreamDetailHeaderProps {
  dreamId: string;
  isEditing: boolean;
  saving: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onExport?: () => void;
}

export function DreamDetailHeader({
  dreamId,
  isEditing,
  saving,
  onBack,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onExport,
}: DreamDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-mono text-muted-foreground">
          {dreamId}
        </span>
      </div>
      <div className="flex gap-1">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button size="icon" onClick={onSave} disabled={saving}>
              <Save className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            {onExport && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onExport}
                title="Export เป็น PDF"
              >
                <FileDown className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
