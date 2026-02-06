import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ENVIRONMENTS } from "@/types/dream";

type EnvironmentOption = (typeof ENVIRONMENTS)[number];

const isStandardEnvironment = (value: string): value is EnvironmentOption =>
  ENVIRONMENTS.includes(value as EnvironmentOption);

interface EnvironmentSelectorProps {
  selectedEnvironments: string[];
  newEnvironment: string;
  onToggleEnvironment: (env: string) => void;
  onNewEnvironmentChange: (value: string) => void;
  onAddEnvironment: () => void;
}

export function EnvironmentSelector({
  selectedEnvironments,
  newEnvironment,
  onToggleEnvironment,
  onNewEnvironmentChange,
  onAddEnvironment,
}: EnvironmentSelectorProps) {
  const customEnvironments = selectedEnvironments.filter(
    (env) => !isStandardEnvironment(env)
  );

  return (
    <div className="space-y-2">
      <Label>สภาพแวดล้อม</Label>
      <div className="flex flex-wrap gap-2">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env}
            type="button"
            onClick={() => onToggleEnvironment(env)}
            className={`tag transition-colors ${
              selectedEnvironments.includes(env)
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-200"
            }`}
          >
            {env}
          </button>
        ))}
      </div>

      {/* Add custom environment */}
      <div className="flex gap-2 mt-2">
        <Input
          type="text"
          placeholder="เพิ่มสภาพแวดล้อมใหม่..."
          value={newEnvironment}
          onChange={(e) => onNewEnvironmentChange(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!newEnvironment}
          onClick={onAddEnvironment}
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          เพิ่ม
        </Button>
      </div>

      {/* Show custom environments */}
      {customEnvironments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {customEnvironments.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => onToggleEnvironment(env)}
              className="tag bg-slate-900 text-white"
            >
              {env}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
