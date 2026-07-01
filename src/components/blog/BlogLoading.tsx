// Editorial circular loader for lazy blog routes.
// Two concentric arcs rotating at different speeds around a small serif
// wordmark — reads as a masthead in motion, not as a stock spinner.
export function BlogLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        {/* Outer thin ring - slow */}
        <svg
          className="absolute inset-0 blog-loader-slow"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity="0.12"
            strokeWidth="1.25"
          />
          <path
            d="M 50 4 A 46 46 0 0 1 96 50"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeOpacity="0.85"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
        {/* Inner arc - faster, opposite direction */}
        <svg
          className="absolute inset-2 blog-loader-fast"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path
            d="M 20 50 A 30 30 0 0 1 80 50"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeOpacity="0.9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="font-serif italic text-foreground/70 select-none"
          style={{ fontSize: 15, letterSpacing: "-0.01em" }}
        >
          na
        </span>
      </div>
      <span className="sr-only">Loading article…</span>
      <style>{`
        @keyframes blog-loader-spin { to { transform: rotate(360deg); } }
        @keyframes blog-loader-spin-rev { to { transform: rotate(-360deg); } }
        .blog-loader-slow { animation: blog-loader-spin 2.6s linear infinite; transform-origin: 50% 50%; }
        .blog-loader-fast { animation: blog-loader-spin-rev 1.4s cubic-bezier(0.6, 0.05, 0.4, 0.95) infinite; transform-origin: 50% 50%; }
        @media (prefers-reduced-motion: reduce) {
          .blog-loader-slow, .blog-loader-fast { animation-duration: 6s; }
        }
      `}</style>
    </div>
  );
}

export default BlogLoading;
