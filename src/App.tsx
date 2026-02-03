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
import NotFound from "./pages/NotFound";
import { getSessionPhenomenon } from "@/utils/raritySystem";
import { applyMoonTheme } from "@/utils/moonTheme";
import { APP_VERSION } from "@/config/appVersion";
import { AppUpdateProvider } from "@/hooks/useAppUpdate";

const queryClient = new QueryClient();

const App = () => {
  // Apply moon theme globally on app mount
  useEffect(() => {
    const { phenomenon } = getSessionPhenomenon();
    applyMoonTheme(phenomenon);
    console.log("🌙 Global Moon Theme Applied:", phenomenon.name);
    console.log(
      `📦 App Version: ${APP_VERSION} | Build: ${new Date().toISOString()}`,
    );
  }, []);

  return (
    <AppUpdateProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            basename={
              import.meta.env.MODE === "production" ? "/dream-weaver-log" : "/"
            }
          >
            <Routes>
              {/* Home page without Layout for full-screen hero */}
              <Route path="/" element={<Home />} />

              {/* Library page without Layout for full-screen experience */}
              <Route path="/library" element={<Library />} />

              {/* Story Mode page without Layout for full-screen experience */}
              <Route path="/story" element={<StoryModePage />} />

              {/* Other pages with Layout */}
              <Route
                path="/*"
                element={
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
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppUpdateProvider>
  );
};

export default App;
