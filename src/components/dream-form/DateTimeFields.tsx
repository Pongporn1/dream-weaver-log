import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeFieldsProps {
  date: string;
  wakeTime: string;
  onDateChange: (value: string) => void;
  onWakeTimeChange: (value: string) => void;
}

export function DateTimeFields({ date, wakeTime, onDateChange, onWakeTimeChange }: DateTimeFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="date">วันที่ฝัน</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wakeTime">เวลาตื่น (ถ้าจำได้)</Label>
        <Input
          id="wakeTime"
          type="time"
          value={wakeTime}
          onChange={(e) => onWakeTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}
