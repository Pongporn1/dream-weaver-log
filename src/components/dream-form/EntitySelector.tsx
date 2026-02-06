import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface EntitySelectorProps {
  entities: { id: string; name: string }[];
  selectedEntities: string[];
  newEntity: string;
  onToggleEntity: (entityName: string) => void;
  onNewEntityChange: (value: string) => void;
}

export function EntitySelector({
  entities,
  selectedEntities,
  newEntity,
  onToggleEntity,
  onNewEntityChange,
}: EntitySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>ตัวละคร/สิ่งมีชีวิต</Label>
      <div className="space-y-2">
        {entities.map((entity) => (
          <div key={entity.id} className="flex items-center gap-2">
            <Checkbox
              id={entity.id}
              checked={selectedEntities.includes(entity.name)}
              onCheckedChange={() => onToggleEntity(entity.name)}
              className="border-slate-400 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white data-[state=checked]:border-slate-900"
            />
            <label htmlFor={entity.id} className="text-sm">
              {entity.name}
            </label>
          </div>
        ))}
      </div>
      <Input
        placeholder="หรือเพิ่มตัวละครใหม่..."
        value={newEntity}
        onChange={(e) => onNewEntityChange(e.target.value)}
      />
    </div>
  );
}
