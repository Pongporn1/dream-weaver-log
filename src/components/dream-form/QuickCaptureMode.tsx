import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DreamTypeSelector } from "@/components/dream-form/DreamTypeSelector";
import { Zap, Maximize2 } from "lucide-react";
import { DreamLog } from "@/types/dream";

interface QuickCaptureModeProps {
  form: {
    date: string;
    wakeTime: string;
    world: string;
    storySummary: string;
    dreamTypes: string[];
  };
  onFormChange: (updates: Partial<QuickCaptureModeProps["form"]>) => void;
  onSave: () => void;
  onSwitchToFull: () => void;
  saving: boolean;
}

export function QuickCaptureMode({
  form,
  onFormChange,
  onSave,
  onSwitchToFull,
  saving,
}: QuickCaptureModeProps) {
  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold">บันทึกเร็ว</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSwitchToFull}
          className="text-xs"
        >
          <Maximize2 className="w-3.5 h-3.5 mr-1" />
          โหมดเต็ม
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        บันทึกฝันก่อนจะลืม! พิมพ์เรื่องย่อสั้นๆ แล้วกด Save ได้เลย
      </p>

      {/* Quick Form */}
      <div className="space-y-4">
        {/* Story Summary - ฟิลด์หลัก */}
        <div>
          <Label htmlFor="quick-story" className="text-base">
            เรื่องย่อความฝัน <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            เล่าสั้นๆ ว่าฝันอะไร - เติมรายละเอียดทีหลังได้
          </p>
          <Textarea
            id="quick-story"
            placeholder="เช่น: ฝันว่าบินไปเที่ยวทะเล แล้วเจอเพื่อนเก่า..."
            value={form.storySummary}
            onChange={(e) => onFormChange({ storySummary: e.target.value })}
            className="min-h-[160px] text-base"
            autoFocus
          />
        </div>

        {/* Date/Time - แถวเดียว */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="quick-date" className="text-sm">
              วันที่
            </Label>
            <Input
              id="quick-date"
              type="date"
              value={form.date}
              onChange={(e) => onFormChange({ date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="quick-time" className="text-sm">
              เวลาตื่น
            </Label>
            <Input
              id="quick-time"
              type="time"
              value={form.wakeTime}
              onChange={(e) => onFormChange({ wakeTime: e.target.value })}
            />
          </div>
        </div>

        {/* World - Optional */}
        <div>
          <Label htmlFor="quick-world" className="text-sm">
            โลกในฝัน (ถ้าจำได้)
          </Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            ใส่ชื่อโลก หรือทิ้งไว้ก็ได้
          </p>
          <Input
            id="quick-world"
            placeholder="เช่น: โลกแห่งทะเล, โลกเมืองใหญ่"
            value={form.world}
            onChange={(e) => onFormChange({ world: e.target.value })}
          />
        </div>

        {/* Dream Types - Optional */}
        <DreamTypeSelector
          selectedTypes={form.dreamTypes}
          onToggleType={(type) => {
            onFormChange({
              dreamTypes: form.dreamTypes.includes(type)
                ? form.dreamTypes.filter((t) => t !== type)
                : [...form.dreamTypes, type],
            });
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onSave}
          disabled={saving || !form.storySummary.trim()}
          className="flex-1"
          size="lg"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
        <Button
          variant="outline"
          onClick={onSwitchToFull}
          disabled={saving}
          size="lg"
        >
          เติมรายละเอียดเพิ่ม
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        💡 บันทึกแล้วสามารถกลับมาเติมรายละเอียดเพิ่มทีหลังได้
      </p>
    </div>
  );
}
