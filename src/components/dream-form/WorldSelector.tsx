import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorldSelectorProps {
  worlds: { id: string; name: string }[];
  selectedWorld: string;
  newWorld: string;
  onWorldChange: (value: string) => void;
  onNewWorldChange: (value: string) => void;
}

export function WorldSelector({
  worlds,
  selectedWorld,
  newWorld,
  onWorldChange,
  onNewWorldChange,
}: WorldSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>World</Label>
      <Select value={selectedWorld} onValueChange={onWorldChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select or create new" />
        </SelectTrigger>
        <SelectContent>
          {worlds.map((w) => (
            <SelectItem key={w.id} value={w.name}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="หรือสร้างโลกใหม่..."
        value={newWorld}
        onChange={(e) => onNewWorldChange(e.target.value)}
      />
    </div>
  );
}
