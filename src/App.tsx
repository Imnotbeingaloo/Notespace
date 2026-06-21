import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import AppPage from "./pages/Index";
import AuthPage from "./pages/Auth";
import PricingPage from "./pages/Pricing";
import FeaturesPage from "./pages/Features";
import AboutPage from "./pages/About";
import HowItWorksPage from "./pages/HowItWorks";
import TrashPage from "./pages/Trash";
import TemporaryWorkspacePage from "./pages/TemporaryWorkspace";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
const SharedNotePage = lazy(() => import("./pages/SharedNote"));
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePaperStyleTransition } from "@/hooks/use-paper-style";
import { PaperStyleSwitcher } from "@/components/PaperStyleSwitcher";

function PaperStyleTransitionOverlay() {
  const transitioning = usePaperStyleTransition();
  // Block background scroll and swallow stray key events while the overlay is up.
  useEffect(() => {
    if (!transitioning) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      // Don't let Escape/Tab leak to the editor underneath.
      if (e.key === "Escape" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [transitioning]);
  if (!transitioning) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Switching notebook paper style"
      tabIndex={-1}
      className="fixed inset-0 z-[2147483646] bg-background/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 outline-none"
    >
      <PaperStyleSwitcher />
      <span className="sr-only">Applying the new notebook paper style, please wait.</span>
    </div>
  );
}

const queryClient = new QueryClient();

// Force light theme on marketing pages, restore preference (light/dark/system) on app pages
function ThemeController() {
  const { pathname } = useLocation();
  const { setTheme } = useTheme();

  useEffect(() => {
    const isAppPage =
      pathname.startsWith("/app") || pathname === "/home" || pathname === "/trash";
    if (isAppPage) {
      const saved = localStorage.getItem("app-theme") || "system";
      setTheme(saved);
    } else {
      setTheme("light");
    }
  }, [pathname, setTheme]);

  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ScrollToTop />
              <ThemeController />
              <PaperStyleTransitionOverlay />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/home" element={<AppPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/trash" element={<TrashPage />} />
                <Route path="/app/temporary" element={<TemporaryWorkspacePage />} />
                <Route path="/shared/:token" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><SharedNotePage /></Suspense>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MotionConfig>
  </ThemeProvider>
);

export default App;
