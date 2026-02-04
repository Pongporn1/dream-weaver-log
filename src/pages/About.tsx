import { useState } from "react";
import { Info, Download, RefreshCw, Loader2 } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { APP_VERSION } from "@/config/appVersion";
import { PixelBorder } from "@/components/PixelBorder";
import { PixelLoadingBar } from "@/components/PixelLoadingBar";

export default function About() {
  const {
    updateAvailable,
    isChecking,
    isUpdating,
    lastCheckedAt,
    checkForUpdates,
    applyUpdate,
  } = useAppUpdate();

  const [loadingProgress, setLoadingProgress] = useState(0);

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

        <AnimatedSection delay={120} duration={400}>
          <section className="card-minimal space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">อัปเดตแอป</h2>
                <p className="text-sm text-muted-foreground">
                  เวอร์ชันปัจจุบัน: {APP_VERSION}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {updateAvailable ? (
                  <Button onClick={applyUpdate} disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isUpdating ? "กำลังดาวน์โหลด..." : "ดาวน์โหลดอัปเดต"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={checkForUpdates}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {isChecking ? "กำลังตรวจสอบ..." : "ตรวจสอบอัปเดต"}
                  </Button>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  updateAvailable
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-muted-foreground/40"
                }`}
              />
              {isChecking
                ? "กำลังตรวจสอบเวอร์ชันล่าสุด..."
                : updateAvailable
                  ? "พบเวอร์ชันใหม่ พร้อมให้ดาวน์โหลดและรีโหลดหน้า"
                  : "ยังเป็นเวอร์ชันล่าสุด"}
            </div>
            {lastCheckedAt && (
              <div className="text-xs text-muted-foreground">
                ตรวจสอบล่าสุด:{" "}
                {new Date(lastCheckedAt).toLocaleString("th-TH")}
              </div>
            )}
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
