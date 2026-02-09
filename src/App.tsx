import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Home from "./pages/Home";
import DreamLogs from "./pages/DreamLogs";
import NewDreamLog from "./pages/NewDreamLog";
import DreamDetail from "./pages/DreamDetail";
import Library from "./pages/Library";
import Statistics from "./pages/Statistics";
import StoryModePage from "./pages/StoryModePage";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import { APP_VERSION } from "@/config/appVersion";
import { AppUpdateProvider } from "@/hooks/useAppUpdate";
import { PixelParticleEffects } from "@/components/PixelParticleEffects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { syncUnlockedCollection } from "@/lib/moonUnlock";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.reducedMotion = prefersReducedMotion
      ? "true"
      : "false";
  }, [prefersReducedMotion]);

  // Apply moon theme globally on app mount
  useEffect(() => {
    const { phenomenon } = getSessionPhenomenon();
    applyMoonTheme(phenomenon);
    console.log("🌙 Global Moon Theme Applied:", phenomenon.name);
    console.log(
      `📦 App Version: ${APP_VERSION} | Build: ${new Date().toISOString()}`,
    );
  }, []);

  // Ensure unlock state is reflected in collection data
  useEffect(() => {
    syncUnlockedCollection();
  }, []);

  return (
    <AppUpdateProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              basename={
                import.meta.env.MODE === "production" ? "/dream-weaver-log" : "/"
              }
            >
              <PixelParticleEffects />
              <Routes>
                {/* Auth page - public */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/story" element={<ProtectedRoute><StoryModePage /></ProtectedRoute>} />

                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/logs" element={<DreamLogs />} />
                          <Route path="/logs/new" element={<NewDreamLog />} />
                          <Route path="/logs/:id" element={<DreamDetail />} />
                          <Route path="/statistics" element={<Statistics />} />
                          <Route path="/about" element={<About />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AppUpdateProvider>
  );
};

export default App;
