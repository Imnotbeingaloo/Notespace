// Minimal, typographic loading state for lazy blog routes.
// No pulsing halo, no "loading…" copy, no spinner — just the wordmark
// with a thin underline that fills once. Reads like a print masthead.
export function BlogLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-start gap-3">
        <span className="font-serif text-[1.35rem] tracking-tight text-foreground/90">
          Notebook Archive
        </span>
        <div className="relative h-px w-44 bg-foreground/10 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-full bg-foreground/70 origin-left blog-loading-fill" />
        </div>
      </div>
      <style>{`
        @keyframes blog-loading-fill {
          0%   { transform: scaleX(0); }
          70%  { transform: scaleX(0.85); }
          100% { transform: scaleX(1); }
        }
        .blog-loading-fill {
          animation: blog-loading-fill 1.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default BlogLoading;
