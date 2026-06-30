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
import ResetPasswordPage from "./pages/ResetPassword";
import PricingPage from "./pages/Pricing";
import FeaturesPage from "./pages/Features";
import AboutPage from "./pages/About";
import HowItWorksPage from "./pages/HowItWorks";
import TrashPage from "./pages/Trash";
import TemporaryWorkspacePage from "./pages/TemporaryWorkspace";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
const SharedNotePage = lazy(() => import("./pages/SharedNote"));
const BlogBestAINoteTakingApps = lazy(() => import("./pages/BlogBestAINoteTakingApps"));
const BlogBestNoteTakingAppForWriters = lazy(() => import("./pages/BlogBestNoteTakingAppForWriters"));
const BlogAINoteTakingAppForStudents = lazy(() => import("./pages/BlogAINoteTakingAppForStudents"));
const BlogKiNotizenApp = lazy(() => import("./pages/BlogKiNotizenApp"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogNotionAlternatives = lazy(() => import("./pages/BlogNotionAlternatives"));
const BlogObsidianAlternatives = lazy(() => import("./pages/BlogObsidianAlternatives"));
const BlogEvernoteAlternatives = lazy(() => import("./pages/BlogEvernoteAlternatives"));
const BlogOtterAlternative = lazy(() => import("./pages/BlogOtterAlternative"));
const BlogNotebookLMAlternative = lazy(() => import("./pages/BlogNotebookLMAlternative"));
const BlogOneNoteAlternatives = lazy(() => import("./pages/BlogOneNoteAlternatives"));
const BlogBestNoteTakingApp = lazy(() => import("./pages/BlogBestNoteTakingApp"));
const BlogAIVoiceNotes = lazy(() => import("./pages/BlogAIVoiceNotes"));
const BlogAIWritingAssistants = lazy(() => import("./pages/BlogAIWritingAssistants"));
const BlogAILiteratureReview = lazy(() => import("./pages/BlogAILiteratureReview"));
const UseCasesIndex = lazy(() => import("./pages/UseCasesIndex"));
const UseCaseStudents = lazy(() => import("./pages/UseCaseStudents"));
const UseCaseWriters = lazy(() => import("./pages/UseCaseWriters"));
const UseCaseResearchers = lazy(() => import("./pages/UseCaseResearchers"));
const UseCaseProjectManagers = lazy(() => import("./pages/UseCaseProjectManagers"));
const AdminReferrals = lazy(() => import("./pages/AdminReferrals"));
const AdminAuthLogs = lazy(() => import("./pages/AdminAuthLogs"));
const CompareIndex = lazy(() => import("./pages/CompareIndex"));
const Compare = lazy(() => import("./pages/Compare"));
const TemplatesGallery = lazy(() => import("./pages/TemplatesGallery"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const LearnIndex = lazy(() => import("./pages/LearnIndex"));
const LearnEntry = lazy(() => import("./pages/LearnEntry"));
const BlogHowToMakeStudyPlan = lazy(() => import("./pages/BlogHowToMakeStudyPlan"));
const BlogHowToMakeStudyPlanForExams = lazy(() => import("./pages/BlogHowToMakeStudyPlanForExams"));
const BlogHowToMakeRevisionTimetable = lazy(() => import("./pages/BlogHowToMakeRevisionTimetable"));
const TemplateStudyPlanner = lazy(() => import("./pages/TemplateStudyPlanner"));
const VerifiedPage = lazy(() => import("./pages/Verified"));
const StudyPlanner = lazy(() => import("./pages/StudyPlanner"));
const RevisionTimetable = lazy(() => import("./pages/RevisionTimetable"));
const TemplateRevisionTimetable = lazy(() => import("./pages/TemplateRevisionTimetable"));
const BlogGCSERevisionGuide = lazy(() => import("./pages/BlogGCSERevisionGuide"));
const BlogALevelRevisionGuide = lazy(() => import("./pages/BlogALevelRevisionGuide"));
const BlogHSCVCEStudyNotes = lazy(() => import("./pages/BlogHSCVCEStudyNotes"));
const PomodoroNotes = lazy(() => import("./pages/PomodoroNotes"));



import { captureReferralFromUrl } from "@/lib/referral";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BlogSkeleton } from "@/components/blog/BlogSkeleton";
import { usePaperStyleTransition } from "@/hooks/use-paper-style";
import { PaperStyleSwitcher } from "@/components/PaperStyleSwitcher";
import { NetworkStatusToasts } from "@/components/NetworkStatusToasts";


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

// Capture ?ref / ?utm_* params on first landing and persist to localStorage.
// Attached to user_metadata on signup (see AuthContext.signUp).
function ReferralCapture() {
  const { pathname } = useLocation();
  useEffect(() => { captureReferralFromUrl(); }, [pathname]);
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
              <ReferralCapture />
              <NetworkStatusToasts />

              <PaperStyleTransitionOverlay />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/home" element={<AppPage />} />
               <Route path="/auth" element={<AuthPage />} />
               <Route path="/verified" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><VerifiedPage /></Suspense>} />
               <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/trash" element={<TrashPage />} />
                <Route path="/app/temporary" element={<TemporaryWorkspacePage />} />
                <Route path="/shared/:token" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><SharedNotePage /></Suspense>} />
                <Route path="/blog/best-ai-note-taking-apps-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogBestAINoteTakingApps /></Suspense>} />
                <Route path="/blog/best-note-taking-app-for-writers" element={<Suspense fallback={<BlogSkeleton />}><BlogBestNoteTakingAppForWriters /></Suspense>} />
                <Route path="/blog" element={<Suspense fallback={<BlogSkeleton />}><BlogIndex /></Suspense>} />
                <Route path="/blog/ai-note-taking-app-for-students" element={<Suspense fallback={<BlogSkeleton />}><BlogAINoteTakingAppForStudents /></Suspense>} />
                <Route path="/blog/ki-notizen-app" element={<Suspense fallback={<BlogSkeleton />}><BlogKiNotizenApp /></Suspense>} />
                <Route path="/blog/notion-alternatives-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogNotionAlternatives /></Suspense>} />
                <Route path="/blog/obsidian-alternatives-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogObsidianAlternatives /></Suspense>} />
                <Route path="/blog/evernote-alternatives-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogEvernoteAlternatives /></Suspense>} />
                <Route path="/blog/onenote-alternatives-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogOneNoteAlternatives /></Suspense>} />
                <Route path="/blog/otter-ai-alternative-for-students" element={<Suspense fallback={<BlogSkeleton />}><BlogOtterAlternative /></Suspense>} />
                <Route path="/blog/best-note-taking-app-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogBestNoteTakingApp /></Suspense>} />
                <Route path="/blog/ai-voice-notes-meeting-transcription" element={<Suspense fallback={<BlogSkeleton />}><BlogAIVoiceNotes /></Suspense>} />
                <Route path="/blog/best-ai-writing-assistants-for-note-takers" element={<Suspense fallback={<BlogSkeleton />}><BlogAIWritingAssistants /></Suspense>} />
                <Route path="/blog/ai-literature-review-guide" element={<Suspense fallback={<BlogSkeleton />}><BlogAILiteratureReview /></Suspense>} />
                <Route path="/blog/how-to-make-a-study-plan" element={<Suspense fallback={<BlogSkeleton />}><BlogHowToMakeStudyPlan /></Suspense>} />
                <Route path="/blog/how-to-make-a-study-plan-for-exams" element={<Suspense fallback={<BlogSkeleton />}><BlogHowToMakeStudyPlanForExams /></Suspense>} />
                <Route path="/blog/how-to-make-a-revision-timetable" element={<Suspense fallback={<BlogSkeleton />}><BlogHowToMakeRevisionTimetable /></Suspense>} />
                <Route path="/blog/gcse-revision-guide-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogGCSERevisionGuide /></Suspense>} />
                <Route path="/blog/a-level-revision-guide-2026" element={<Suspense fallback={<BlogSkeleton />}><BlogALevelRevisionGuide /></Suspense>} />
                <Route path="/blog/hsc-vce-study-notes-guide" element={<Suspense fallback={<BlogSkeleton />}><BlogHSCVCEStudyNotes /></Suspense>} />
                <Route path="/study-planner" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><StudyPlanner /></Suspense>} />
                <Route path="/revision-timetable" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><RevisionTimetable /></Suspense>} />
                <Route path="/templates/revision-timetable-template" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><TemplateRevisionTimetable /></Suspense>} />
                <Route path="/pomodoro-notes" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><PomodoroNotes /></Suspense>} />


                <Route path="/use-cases" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><UseCasesIndex /></Suspense>} />
                <Route path="/use-cases/students" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><UseCaseStudents /></Suspense>} />
                <Route path="/use-cases/writers" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><UseCaseWriters /></Suspense>} />
                <Route path="/use-cases/researchers" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><UseCaseResearchers /></Suspense>} />
                <Route path="/use-cases/project-managers" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><UseCaseProjectManagers /></Suspense>} />
                <Route path="/admin/referrals" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><AdminReferrals /></Suspense>} />
                <Route path="/admin/auth-logs" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><AdminAuthLogs /></Suspense>} />
                <Route path="/compare" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><CompareIndex /></Suspense>} />
                <Route path="/compare/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><Compare /></Suspense>} />
                <Route path="/templates" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><TemplatesGallery /></Suspense>} />
                <Route path="/templates/study-planner" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><TemplateStudyPlanner /></Suspense>} />
                <Route path="/templates/:id" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><TemplateDetail /></Suspense>} />
                <Route path="/learn" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><LearnIndex /></Suspense>} />
                <Route path="/learn/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}><LearnEntry /></Suspense>} />

                
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
