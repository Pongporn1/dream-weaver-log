import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DreamCard } from "@/components/DreamCard";
import { DreamLog } from "@/types/dream";

interface RecentDreamsProps {
  dreams: DreamLog[];
}

export function RecentDreams({ dreams }: RecentDreamsProps) {
  if (dreams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>ยังไม่มีบันทึก</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/logs/new">สร้างบันทึกแรก</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">บันทึกล่าสุด</h2>
        <Link to="/logs" className="text-sm text-primary hover:underline">
          ดูทั้งหมด
        </Link>
      </div>
      <div className="space-y-2">
        {dreams.map((dream) => (
          <DreamCard key={dream.id} dream={dream} compact />
        ))}
      </div>
    </div>
  );
}
