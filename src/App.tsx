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
import SleepCalculator from "./pages/SleepCalculator";
import Librarian from "./pages/Librarian";
import Statistics from "./pages/Statistics";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/logs" element={<DreamLogs />} />
            <Route path="/logs/new" element={<NewDreamLog />} />
            <Route path="/logs/:id" element={<DreamDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/sleep" element={<SleepCalculator />} />
            <Route path="/librarian" element={<Librarian />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
