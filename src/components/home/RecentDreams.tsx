import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DreamCard } from "@/components/DreamCard";
import { DreamLog } from "@/types/dream";
import { AnimatedSection } from "./AnimatedSection";

interface RecentDreamsProps {
  dreams: DreamLog[];
}

export function RecentDreams({ dreams }: RecentDreamsProps) {
  if (dreams.length === 0) {
    return (
      <AnimatedSection delay={500} duration={400}>
        <div className="text-center py-8 text-muted-foreground">
          <p>ยังไม่มีบันทึก</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/logs/new">สร้างบันทึกแรก</Link>
          </Button>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatedSection delay={450} duration={400}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">บันทึกล่าสุด</h2>
          <Link to="/logs" className="text-sm text-primary hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
      </AnimatedSection>
      <div className="space-y-2">
        {dreams.map((dream, index) => (
          <AnimatedSection key={dream.id} delay={500 + index * 80} duration={400}>
            <DreamCard dream={dream} compact />
          </AnimatedSection>
        ))}
      </div>
    </div>
  );
}
