import { Link } from "react-router-dom";
import { Plus, Library, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Button asChild variant="outline" className="w-full justify-start gap-2 h-12">
        <Link to="/logs/new">
          <Plus className="w-5 h-5" />
          <span className="flex-1 text-left">บันทึกฝันใหม่ (กรอกเอง)</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start gap-2 h-12">
        <Link to="/library">
          <Library className="w-5 h-5" />
          <span className="flex-1 text-left">ห้องสมุดความฝัน</span>
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start gap-2 h-12">
        <Link to="/logs">
          <Moon className="w-5 h-5" />
          <span className="flex-1 text-left">ดูบันทึกทั้งหมด</span>
        </Link>
      </Button>
    </div>
  );
}
