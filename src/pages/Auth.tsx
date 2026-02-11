import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Loader2, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MoonShowcase } from "@/components/auth/MoonShowcase";
import { motion } from "framer-motion";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getAuthErrorMessage = (error: unknown) => {
  const fallbackMessage = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
  if (!(error instanceof Error)) return fallbackMessage;
  const message = error.message.toLowerCase();
  if (message.includes("invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (message.includes("email not confirmed")) return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  if (message.includes("user already registered")) return "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน";
  if (message.includes("password should be at least")) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  if (message.includes("network") || message.includes("failed to fetch")) return "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง";
  return error.message || fallbackMessage;
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "กรุณากรอกอีเมล", description: "ระบุอีเมลที่ใช้สมัครบัญชี", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      toast({ title: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว", description: "กรุณาตรวจสอบอีเมลของคุณ" });
      setIsForgotPassword(false);
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: getAuthErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: displayName || undefined } },
        });
        if (error) throw error;
        toast({ title: "ลงทะเบียนสำเร็จ", description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี" });
      }
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: getAuthErrorMessage(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) throw error;
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: getAuthErrorMessage(error), variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen moon background */}
      <MoonShowcase />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* Auth Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-10 w-full max-w-sm mx-4 p-6 rounded-2xl space-y-5"
        style={{
          background: "rgba(10, 10, 30, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-1" style={{ background: "rgba(109, 40, 217, 0.15)" }}>
            <Moon className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-white">
            Dream Weaver Log
          </h1>
          <p className="text-xs text-white/50">
            {isForgotPassword
              ? "กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน"
              : isLogin
              ? "เข้าสู่ระบบเพื่อจัดการบันทึกความฝัน"
              : "สร้างบัญชีใหม่เพื่อเริ่มต้นการเดินทาง"}
          </p>
        </div>

        {!isForgotPassword && (
          <>
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              variant="outline"
              className="w-full h-10 gap-2 text-white/90 border-white/10 bg-white/5 hover:bg-white/10"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              เข้าสู่ระบบด้วย Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 text-white/40" style={{ background: "rgba(10,10,30,0.75)" }}>หรือ</span>
              </div>
            </div>
          </>
        )}

        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-white/50">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="email" type="email" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/50"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 font-medium bg-purple-600 hover:bg-purple-500 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              ส่งลิงก์รีเซ็ตรหัสผ่าน
            </Button>
          </form>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5"
              >
                <Label htmlFor="displayName" className="text-xs text-white/50">ชื่อแสดง</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    id="displayName" type="text" placeholder="ชื่อที่ต้องการแสดง"
                    value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/50"
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-white/50">อีเมล</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="email" type="email" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoCapitalize="none" autoCorrect="off" spellCheck={false}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs text-white/50">รหัสผ่าน</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} autoCapitalize="none" autoCorrect="off"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-purple-500/50"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 font-medium bg-purple-600 hover:bg-purple-500 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-white/40">
          {isForgotPassword ? (
            <button onClick={() => setIsForgotPassword(false)} className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>
          ) : (
            <>
              {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
                {isLogin ? "สร้างบัญชี" : "เข้าสู่ระบบ"}
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
