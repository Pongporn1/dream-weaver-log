import { Link } from "react-router-dom";
import { Plus, Library, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./AnimatedSection";

export function QuickActions() {
  const actions = [
    { to: "/logs/new", icon: Plus, label: "บันทึกฝันใหม่ (กรอกเอง)" },
    { to: "/library", icon: Library, label: "ห้องสมุดความฝัน" },
    { to: "/logs", icon: Moon, label: "ดูบันทึกทั้งหมด" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {actions.map((action, index) => (
        <AnimatedSection key={action.to} delay={200 + index * 80} duration={400}>
          <Button asChild variant="outline" className="w-full justify-start gap-2 h-12">
            <Link to={action.to}>
              <action.icon className="w-5 h-5" />
              <span className="flex-1 text-left">{action.label}</span>
            </Link>
          </Button>
        </AnimatedSection>
      ))}
    </div>
  );
}
