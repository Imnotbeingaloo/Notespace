// Lightweight route prefetcher. On hover/focus we ask the browser to
// download (but not execute) the JS chunk for a given path so the next
// click feels instant. Safe to call repeatedly - the browser dedupes.

const prefetched = new Set<string>();

// Map of pathname -> dynamic import factory. Keep in sync with App.tsx
// lazy() calls. We only register blog routes here; that's where the heavy
// per-post chunks live.
const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  "/blog": () => import("@/pages/BlogIndex"),
  "/blog/best-ai-note-taking-apps-2026": () => import("@/pages/BlogBestAINoteTakingApps"),
  "/blog/best-note-taking-app-for-writers": () => import("@/pages/BlogBestNoteTakingAppForWriters"),
  "/blog/ai-note-taking-app-for-students": () => import("@/pages/BlogAINoteTakingAppForStudents"),
  "/blog/ki-notizen-app": () => import("@/pages/BlogKiNotizenApp"),
  "/blog/notion-alternatives-2026": () => import("@/pages/BlogNotionAlternatives"),
  "/blog/obsidian-alternatives-2026": () => import("@/pages/BlogObsidianAlternatives"),
  "/blog/evernote-alternatives-2026": () => import("@/pages/BlogEvernoteAlternatives"),
  "/blog/onenote-alternatives-2026": () => import("@/pages/BlogOneNoteAlternatives"),
  "/blog/best-note-taking-app-2026": () => import("@/pages/BlogBestNoteTakingApp"),
  "/blog/ai-voice-notes-meeting-transcription": () => import("@/pages/BlogAIVoiceNotes"),
  "/blog/best-ai-writing-assistants-for-note-takers": () => import("@/pages/BlogAIWritingAssistants"),
  "/blog/ai-literature-review-guide": () => import("@/pages/BlogAILiteratureReview"),
  "/blog/how-to-make-a-study-plan": () => import("@/pages/BlogHowToMakeStudyPlan"),
  "/blog/how-to-make-a-study-plan-for-exams": () => import("@/pages/BlogHowToMakeStudyPlanForExams"),
  "/blog/how-to-make-a-revision-timetable": () => import("@/pages/BlogHowToMakeRevisionTimetable"),
};

export function prefetchRoute(path: string) {
  if (prefetched.has(path)) return;
  const loader = ROUTE_LOADERS[path];
  if (!loader) return;
  prefetched.add(path);
  // Defer to idle so we never compete with the active page's resources.
  const run = () => {
    loader().catch(() => prefetched.delete(path));
  };
  if (typeof (window as any).requestIdleCallback === "function") {
    (window as any).requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 200);
  }
}

// Convenience props you can spread onto a <Link>:
//   <Link to={to} {...prefetchOnHover(to)}>
export function prefetchOnHover(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}
