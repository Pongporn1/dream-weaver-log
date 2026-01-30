import { AnimatedSection } from "./AnimatedSection";

export function HomeGreeting() {
  return (
    <AnimatedSection delay={0} duration={500}>
      <div className="space-y-2">
        <h1 className="text-2xl">สวัสดีบอน</h1>
        <p className="text-muted-foreground">วันนี้อยากเล่าเรื่องอะไรหรอ</p>
      </div>
    </AnimatedSection>
  );
}
