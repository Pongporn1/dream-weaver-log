import { Sparkles, Edit2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AISuggestions } from "./QuickDreamEntry";

interface AISuggestionsPreviewProps {
  suggestions: AISuggestions;
  editing: boolean;
  analyzing: boolean;
  onToggleEdit: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onUpdate: (field: string, value: string | string[] | number) => void;
}

export function AISuggestionsPreview({
  suggestions,
  editing,
  analyzing,
  onToggleEdit,
  onConfirm,
  onCancel,
  onUpdate,
}: AISuggestionsPreviewProps) {
  return (
    <div className="card-minimal space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI วิเคราะห์แล้ว</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggleEdit}>
          {editing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">โลก: </span>
          {editing ? (
            <Input
              value={suggestions.world}
              onChange={(e) => onUpdate("world", e.target.value)}
              className="mt-1 h-8"
            />
          ) : (
            <Badge variant="secondary">{suggestions.world}</Badge>
          )}
        </div>

        <div>
          <span className="text-muted-foreground">ระดับภัย: </span>
          <Badge variant={suggestions.threatLevel >= 3 ? "destructive" : "secondary"}>
            Level {suggestions.threatLevel}
          </Badge>
        </div>

        {suggestions.entities?.length > 0 && (
          <div>
            <span className="text-muted-foreground">Entities: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {suggestions.entities.map((e: string, i: number) => (
                <Badge key={i} variant="outline">{e}</Badge>
              ))}
            </div>
          </div>
        )}

        {suggestions.environments?.length > 0 && (
          <div>
            <span className="text-muted-foreground">Environments: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {suggestions.environments.map((e: string, i: number) => (
                <Badge key={i} variant="outline">{e}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={onConfirm} disabled={analyzing} className="flex-1 gap-2">
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
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
