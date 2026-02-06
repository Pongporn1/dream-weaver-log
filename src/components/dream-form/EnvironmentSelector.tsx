import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ENVIRONMENTS } from "@/types/dream";
import { X, TrendingUp, ChevronDown, ChevronUp, Cloud } from "lucide-react";

type EnvironmentOption = (typeof ENVIRONMENTS)[number];

const isStandardEnvironment = (value: string): value is EnvironmentOption =>
  ENVIRONMENTS.includes(value as EnvironmentOption);

// กลุ่มสภาพแวดล้อมที่ใช้บ่อย
const ENVIRONMENT_PRESETS = [
  {
    label: "ธรรมชาติ (หมอก+ทะเล+ภูเขา)",
    environments: ["fog", "sea", "mountain"],
  },
  {
    label: "เมือง+ฝน+กลางคืน",
    environments: ["city", "rain", "night"],
  },
  {
    label: "อุโมงค์+กลางคืน",
    environments: ["tunnel", "night"],
  },
];

interface EnvironmentSelectorProps {
  selectedEnvironments: string[];
  newEnvironment: string;
  commonEnvironments: string[]; // Top environments ที่ใช้บ่อยจากการนับความถี่
  onToggleEnvironment: (env: string) => void;
  onNewEnvironmentChange: (value: string) => void;
  onAddEnvironment: () => void;
}

export function EnvironmentSelector({
  selectedEnvironments,
  newEnvironment,
  commonEnvironments,
  onToggleEnvironment,
  onNewEnvironmentChange,
  onAddEnvironment,
}: EnvironmentSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [expandedPresets, setExpandedPresets] = useState<Set<number>>(
    new Set(),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const customEnvironments = selectedEnvironments.filter(
    (env) => !isStandardEnvironment(env),
  );

  // Toggle การขยายของ preset
  const togglePresetExpansion = (index: number) => {
    setExpandedPresets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // รวมรายชื่อสภาพแวดล้อมทั้งหมด
  const allEnvironmentNames = useMemo(() => {
    const names = new Set<string>();

    // เพิ่มจาก commonEnvironments
    commonEnvironments.forEach((name) => names.add(name));

    // เพิ่มจาก ENVIRONMENTS
    ENVIRONMENTS.forEach((name) => names.add(name));

    // เพิ่มจาก selectedEnvironments
    selectedEnvironments.forEach((name) => names.add(name));

    return Array.from(names);
  }, [commonEnvironments, selectedEnvironments]);

  // กรองรายชื่อที่ตรงกับการพิมพ์
  const suggestions = useMemo(() => {
    if (!newEnvironment.trim()) return [];

    const searchTerm = newEnvironment.toLowerCase().trim();
    return allEnvironmentNames
      .filter((name) => {
        const lowerName = name.toLowerCase();
        return (
          lowerName.includes(searchTerm) && !selectedEnvironments.includes(name)
        );
      })
      .slice(0, 5);
  }, [newEnvironment, allEnvironmentNames, selectedEnvironments]);

  // ปิด suggestions เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(
      suggestions.length > 0 && newEnvironment.trim().length > 0,
    );
    setSelectedSuggestionIndex(0);
  }, [suggestions, newEnvironment]);

  const selectSuggestion = (envName: string) => {
    onToggleEnvironment(envName);
    onNewEnvironmentChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const [userNavigated, setUserNavigated] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setUserNavigated(true); // ผู้ใช้เลื่อนเลือก suggestion
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setUserNavigated(true); // ผู้ใช้เลื่อนเลือก suggestion
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        // ถ้าผู้ใช้เลื่อนเลือก suggestion ด้วย ↓↑ แล้ว จึงเลือก suggestion
        // ถ้าพิมพ์แล้วกด Enter เฉยๆ = เพิ่มชื่อใหม่
        if (userNavigated && suggestions[selectedSuggestionIndex]) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
          setUserNavigated(false);
        } else {
          onAddEnvironment(); // เพิ่มชื่อใหม่ที่พิมพ์
          setShowSuggestions(false);
          setUserNavigated(false);
        }
        return;
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setUserNavigated(false);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      onAddEnvironment();
    }
  };

  const handleSelectPreset = (presetEnvironments: string[]) => {
    presetEnvironments.forEach((envName) => {
      if (!selectedEnvironments.includes(envName)) {
        onToggleEnvironment(envName);
      }
    });
  };

  const isPresetActive = (presetEnvironments: string[]) => {
    return presetEnvironments.every((env) =>
      selectedEnvironments.includes(env),
    );
  };

  const handleClearAll = () => {
    selectedEnvironments.forEach((env) => {
      onToggleEnvironment(env);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>สภาพแวดล้อม</Label>
        {selectedEnvironments.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3 mr-1" />
            ล้างทั้งหมด ({selectedEnvironments.length})
          </Button>
        )}
      </div>

      {/* แสดงที่เลือกแล้ว */}
      {selectedEnvironments.length > 0 && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs font-medium text-blue-900 mb-1.5">
            ✓ เลือกแล้ว:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedEnvironments.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => onToggleEnvironment(env)}
                className="px-2.5 py-1 text-xs rounded-md border bg-blue-600 text-white border-blue-700 hover:bg-blue-700 transition-colors"
              >
                {env} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* สภาพแวดล้อมที่ใช้บ่อย - อัพเดทอัตโนมัติ */}
      {commonEnvironments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ที่คุณใช้บ่อย (อัพเดทอัตโนมัติ):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {commonEnvironments.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => onToggleEnvironment(env)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  selectedEnvironments.includes(env)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* กลุ่มสภาพแวดล้อม */}
      {ENVIRONMENT_PRESETS.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">
            หรือเลือกทั้งกลุ่มเลย (คลิกลูกศรเพื่อเลือกแบบย่อย):
          </div>
          <div className="space-y-2">
            {ENVIRONMENT_PRESETS.map((preset, index) => {
              const isActive = isPresetActive(preset.environments);
              const isExpanded = expandedPresets.has(index);

              return (
                <div key={index} className="space-y-1">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectPreset(preset.environments)}
                      className={`flex-1 text-xs h-auto py-1.5 px-2.5 transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:text-white"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <Cloud className="w-3 h-3 mr-1.5" />
                      {preset.label}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => togglePresetExpansion(index)}
                      className="h-auto py-1.5 px-2 hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                      {preset.environments.map((env) => (
                        <button
                          key={env}
                          type="button"
                          onClick={() => onToggleEnvironment(env)}
                          className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                            selectedEnvironments.includes(env)
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* สภาพแวดล้อมมาตรฐานทั้งหมด */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">
          สภาพแวดล้อมทั้งหมด:
        </div>
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
      </div>

      {/* เพิ่มสภาพแวดล้อมใหม่ */}
      <div className="pt-2 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="เพิ่มสภาพแวดล้อมใหม่..."
              value={newEnvironment}
              onChange={(e) => onNewEnvironmentChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto"
              >
                <div className="text-xs text-muted-foreground px-3 py-1.5 bg-slate-50 border-b border-slate-200 font-medium">
                  พบสภาพแวดล้อมที่คล้ายกัน:
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors border-b border-slate-100 last:border-b-0 ${
                      index === selectedSuggestionIndex
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {suggestion}
                    {commonEnvironments.includes(suggestion) && (
                      <span className="ml-2 text-xs text-blue-600">
                        ⭐ ใช้บ่อย
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
        {newEnvironment.trim() && suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            กด Enter หรือปุ่ม "เพิ่ม" เพื่อเพิ่มสภาพแวดล้อมใหม่
          </p>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ใช้ ↑↓ เลือก, Enter ยืนยัน, Esc ปิด
          </p>
        )}
      </div>

      {/* Custom environments */}
      {customEnvironments.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground font-medium">
            สภาพแวดล้อมที่เพิ่มเอง:
          </div>
          <div className="flex flex-wrap gap-2">
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
        </div>
      )}
    </div>
  );
}
