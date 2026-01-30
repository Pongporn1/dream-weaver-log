import { Info } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated";

export default function About() {
  return (
    <div className="py-4 space-y-8 pb-20">
      <AnimatedSection delay={0} duration={400}>
        <h1>About / Safety</h1>
      </AnimatedSection>

      <div className="space-y-6">
        <AnimatedSection delay={80} duration={400}>
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-medium">เกี่ยวกับ Dream book</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dream book by Bon เป็นเว็บบันทึกความฝันส่วนตัว
              ออกแบบมาเพื่อจัดระบบและติดตามรูปแบบความฝันอย่างมีโครงสร้าง
              ไม่ใช่ไดอารี่หรือการเล่าเรื่องยาวๆ แต่เป็น structured log
              ที่ช่วยให้เห็นความเชื่อมโยงระหว่างโลก สิ่งมีชีวิต และระบบต่างๆ
              ในความฝัน
            </p>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={160} duration={400}>
          <section className="card-minimal text-center">
            <p className="text-sm text-muted-foreground">
              Dream book by Bon © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Personal Dream Logging System
            </p>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}
