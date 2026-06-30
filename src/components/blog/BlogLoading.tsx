import { BookOpen } from "lucide-react";

// Branded loading screen for lazy-loaded blog routes.
// Replaces the skeleton — feels editorial, not like a half-rendered template.
export function BlogLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <div className="relative h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.75} />
          </div>
        </div>
        <div className="text-center">
          <p className="font-serif text-base text-foreground/90">Opening the notebook…</p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide">Notebook Archive</p>
        </div>
        <div className="h-0.5 w-32 bg-muted overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary rounded-full blog-loading-bar" />
        </div>
      </div>
      <style>{`
        @keyframes blog-loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .blog-loading-bar {
          animation: blog-loading-slide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default BlogLoading;
