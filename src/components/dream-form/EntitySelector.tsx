import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// กลุ่มตัวละครที่ใช้บ่อย (เลือกทั้งกลุ่มพร้อมกัน)
const ENTITY_PRESETS = [
  {
    label: "ผม+น้อง+ที่สาว+แฟนพี่สาว",
    entities: ["ผม", "น้อง", "ที่สาว", "แฟนพี่สาว"],
    icon: Users,
  },
  {
    label: "ผม+น้อง+ที่สาว+แฟนพี่สาว+คนแปลกหน้า",
    entities: ["ผม", "น้อง", "ที่สาว", "แฟนพี่สาว", "คนแปลกหน้า"],
    icon: Users,
  },
  {
    label: "ผม+น่า+น้อง+แม",
    entities: ["ผม", "น่า", "น้อง", "แม"],
    icon: Users,
  },
  {
    label: "เพื่อน+คนแปลกหน้า",
    entities: ["เพื่อน", "คนแปลกหน้า"],
    icon: Users,
  },
];

interface EntitySelectorProps {
  entities: { id: string; name: string }[];
  selectedEntities: string[];
  newEntity: string;
  commonEntities: string[]; // Top entities ที่ใช้บ่อยจากการนับความถี่
  onToggleEntity: (entityName: string) => void;
  onNewEntityChange: (value: string) => void;
  onAddEntity: () => void;
}

export function EntitySelector({
  entities,
  selectedEntities,
  newEntity,
  commonEntities,
  onToggleEntity,
  onNewEntityChange,
  onAddEntity,
}: EntitySelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [expandedPresets, setExpandedPresets] = useState<Set<number>>(
    new Set(),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // รวมรายชื่อทั้งหมดที่มีอยู่ (ไม่ซ้ำ)
  const allEntityNames = useMemo(() => {
    const names = new Set<string>();

    // เพิ่มจาก commonEntities (ที่ใช้บ่อย)
    commonEntities.forEach((name) => names.add(name));

    // เพิ่มจาก entities (ฐานข้อมูล)
    entities.forEach((entity) => names.add(entity.name));

    // เพิ่มจาก selectedEntities (ที่เลือกอยู่)
    selectedEntities.forEach((name) => names.add(name));

    return Array.from(names);
  }, [entities, commonEntities, selectedEntities]);

  // กรองรายชื่อที่ตรงกับการพิมพ์
  const suggestions = useMemo(() => {
    if (!newEntity.trim()) return [];

    const searchTerm = newEntity.toLowerCase().trim();
    return allEntityNames
      .filter((name) => {
        const lowerName = name.toLowerCase();
        // ต้องมีคำที่พิมพ์อยู่ และยังไม่ได้เลือก
        return (
          lowerName.includes(searchTerm) && !selectedEntities.includes(name)
        );
      })
      .slice(0, 5); // แสดงแค่ 5 รายการ
  }, [newEntity, allEntityNames, selectedEntities]);

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

  // แสดง suggestions เมื่อมีคำแนะนำ
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && newEntity.trim().length > 0);
    setSelectedSuggestionIndex(0);
  }, [suggestions, newEntity]);

  // เลือก suggestion
  const selectSuggestion = (entityName: string) => {
    onToggleEntity(entityName);
    onNewEntityChange("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const [userNavigated, setUserNavigated] = useState(false);

  // จัดการ keyboard navigation
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
          onAddEntity(); // เพิ่มชื่อใหม่ที่พิมพ์
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
      onAddEntity();
    }
  };

  // ฟังก์ชันเลือกกลุ่มตัวละครที่ใช้บ่อย
  const handleSelectPreset = (presetEntities: string[]) => {
    presetEntities.forEach((entityName) => {
      // ถ้ายังไม่ได้เลือก ให้เลือกเพิ่ม
      if (!selectedEntities.includes(entityName)) {
        onToggleEntity(entityName);
      }
    });
  };

  // เช็คว่า preset นี้ถูกเลือกครบหรือยัง
  const isPresetActive = (presetEntities: string[]) => {
    return presetEntities.every((entity) => selectedEntities.includes(entity));
  };

  // ล้างตัวละครที่เลือกทั้งหมด
  const handleClearAll = () => {
    selectedEntities.forEach((entity) => {
      onToggleEntity(entity);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>ตัวละคร/สิ่งมีชีวิต</Label>
        {selectedEntities.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-auto py-0.5 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3 mr-1" />
            ล้างทั้งหมด ({selectedEntities.length})
          </Button>
        )}
      </div>

      {/* แสดงที่เลือกแล้ว */}
      {selectedEntities.length > 0 && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs font-medium text-blue-900 mb-1.5">
            ✓ เลือกแล้ว:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedEntities.map((entity) => (
              <button
                key={entity}
                type="button"
                onClick={() => onToggleEntity(entity)}
                className="px-2.5 py-1 text-xs rounded-md border bg-blue-600 text-white border-blue-700 hover:bg-blue-700 transition-colors"
              >
                {entity} ×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* คำเดี่ยวที่ใช้บ่อย - อัพเดทอัตโนมัติจากการใช้งาน */}
      {commonEntities.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>คำที่คุณใช้บ่อย (อัพเดทอัตโนมัติ):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {commonEntities.map((entity) => (
              <button
                key={entity}
                type="button"
                onClick={() => onToggleEntity(entity)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  selectedEntities.includes(entity)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {entity}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* กลุ่มตัวละคร - เลือกทีเดียวหลายคน */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground font-medium">
          หรือเลือกทั้งกลุ่มเลย (คลิกลูกศรเพื่อเลือกแบบย่อย):
        </div>
        <div className="space-y-2">
          {ENTITY_PRESETS.map((preset, index) => {
            const Icon = preset.icon;
            const isActive = isPresetActive(preset.entities);
            const isExpanded = expandedPresets.has(index);

            return (
              <div key={index} className="space-y-1">
                <div className="flex gap-1">
                  {/* ปุ่มเลือกทั้งกลุ่ม */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectPreset(preset.entities)}
                    className={`flex-1 text-xs h-auto py-1.5 px-2.5 transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:text-white"
                        : "hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {preset.label}
                  </Button>

                  {/* ปุ่มขยาย/ย่อ */}
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

                {/* รายการย่อย */}
                {isExpanded && (
                  <div className="ml-4 flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                    {preset.entities.map((entity) => (
                      <button
                        key={entity}
                        type="button"
                        onClick={() => onToggleEntity(entity)}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                          selectedEntities.includes(entity)
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* รายการตัวละครทั้งหมด */}
      <div className="space-y-2 pt-2 border-t">
        <div className="text-xs text-muted-foreground font-medium">
          หรือเลือกแบบละเอียด:
        </div>
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
          {entities.map((entity) => (
            <div key={entity.id} className="flex items-center gap-2">
              <Checkbox
                id={entity.id}
                checked={selectedEntities.includes(entity.name)}
                onCheckedChange={() => onToggleEntity(entity.name)}
                className="border-slate-400 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white data-[state=checked]:border-slate-900"
              />
              <label
                htmlFor={entity.id}
                className="text-sm cursor-pointer flex-1"
              >
                {entity.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* เพิ่มตัวละครใหม่ */}
      <div className="pt-2 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="หรือเพิ่มตัวละครใหม่..."
              value={newEntity}
              onChange={(e) => onNewEntityChange(e.target.value)}
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
                  พบชื่อที่คล้ายกัน (เลือกเพื่อใช้ชื่อเดิม):
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
                    {commonEntities.includes(suggestion) && (
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
            disabled={!newEntity}
            onClick={onAddEntity}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            เพิ่ม
          </Button>
        </div>
        {newEntity.trim() && suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            กด Enter หรือปุ่ม "เพิ่ม" เพื่อเพิ่มชื่อใหม่
          </p>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ใช้ ↑↓ เลือก, Enter ยืนยัน, Esc ปิด
          </p>
        )}
      </div>
    </div>
  );
}
