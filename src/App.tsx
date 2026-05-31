import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "next-themes";
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

const queryClient = new QueryClient();

// Force light theme on marketing pages, restore preference on app pages
function ThemeController() {
  const { pathname } = useLocation();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const isAppPage = pathname === "/app" || pathname === "/trash" || pathname === "/app/temporary";
    if (isAppPage) {
      // Restore saved app theme
      const saved = localStorage.getItem("app-theme") || "light";
      setTheme(saved);
    } else {
      // Force light on marketing pages
      setTheme("light");
    }
  }, [pathname, setTheme]);

  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <ThemeController />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<AppPage />} />
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
  </ThemeProvider>
);

export default App;
