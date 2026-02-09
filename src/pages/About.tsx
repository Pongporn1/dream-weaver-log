import { useState } from "react";
import {
  Info,
  Download,
  RefreshCw,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppUpdate } from "@/hooks/useAppUpdate";
import { APP_VERSION } from "@/config/appVersion";
import {
  verifySecretCode,
  unlockAllMoons,
  areMoonsUnlocked,
  getUnlockStatus,
} from "@/lib/moonUnlock";
import { toast } from "@/hooks/use-toast";
import { DataTransferPanel } from "@/components/DataTransferPanel";

export default function About() {
  const { user, signOut } = useAuth();
  const {
    updateAvailable,
    isChecking,
    isUpdating,
    lastCheckedAt,
    checkForUpdates,
    applyUpdate,
  } = useAppUpdate();

  const [secretCode, setSecretCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(areMoonsUnlocked());

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretCode.trim()) return;

    setIsVerifying(true);
    try {
      const isValid = await verifySecretCode(secretCode);
      if (isValid) {
        unlockAllMoons();
        setIsUnlocked(true);
        toast({
          title: "🌕 ปลดล็อกสำเร็จ!",
          description: "ดวงจันทร์ทั้งหมด 54 ดวงถูกปลดล็อกแล้ว",
        });
        setSecretCode("");

        // Reload page after a short delay to ensure all components load fresh data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "❌ รหัสไม่ถูกต้อง",
          description: "กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Unlock error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบรหัสได้",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
                ตรวจสอบล่าสุด: {new Date(lastCheckedAt).toLocaleString("th-TH")}
              </div>
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay={140} duration={400}>
          <DataTransferPanel />
        </AnimatedSection>

        <AnimatedSection delay={160} duration={400}>
          <section className="card-minimal space-y-4">
            <div className="mb-3">
              <h2 className="text-lg font-medium">Redeem Code</h2>
            </div>

            {isUnlocked ? (
              <div className="space-y-2">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Unlock className="w-5 h-5" />
                    <span className="font-semibold">ปลดล็อกแล้ว!</span>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                    คุณสามารถเข้าถึงดวงจันทร์ทั้งหมด 54 ดวงได้แล้ว 🌕✨
                  </p>
                  {getUnlockStatus().unlockedAt && (
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70 mt-1">
                      ปลดล็อกเมื่อ:{" "}
                      {new Date(getUnlockStatus().unlockedAt!).toLocaleString(
                        "th-TH",
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="secretCode"></Label>
                  <div className="flex gap-2">
                    <Input
                      id="secretCode"
                      type="password"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="ใส่รหัสที่นี่..."
                      className="font-mono"
                      disabled={isVerifying}
                      maxLength={50}
                    />
                    <Button
                      type="submit"
                      disabled={isVerifying || !secretCode.trim()}
                    >
                      {isVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay={200} duration={400}>
          <section className="card-minimal text-center">
            <p className="text-sm text-muted-foreground">
              Dream book by Bon © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Personal Dream Logging System
            </p>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={240} duration={400}>
          <section className="card-minimal space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">บัญชีผู้ใช้</h2>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </Button>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}
