// Blog route loader — on-brand: an animated ruled-paper card with a shimmering
// pen line drawing across it. Fits Notespace's notebook aesthetic.
export function BlogLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="blog-loader-card" role="status" aria-label="Loading article">
        <div className="blog-loader-line blog-loader-line--title" />
        <div className="blog-loader-line" style={{ width: "88%" }} />
        <div className="blog-loader-line" style={{ width: "72%" }} />
        <div className="blog-loader-line" style={{ width: "80%" }} />
        <div className="blog-loader-line" style={{ width: "60%" }} />
      </div>
      <span className="sr-only">Loading article…</span>
      <style>{`
        .blog-loader-card {
          width: min(360px, 86vw);
          padding: 28px 26px;
          border-radius: 14px;
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 12px 40px -20px hsl(var(--foreground) / 0.25);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .blog-loader-line {
          height: 10px;
          border-radius: 4px;
          background: linear-gradient(
            90deg,
            hsl(var(--muted)) 0%,
            hsl(var(--foreground) / 0.10) 50%,
            hsl(var(--muted)) 100%
          );
          background-size: 200% 100%;
          animation: blog-loader-shimmer 1.4s ease-in-out infinite;
        }
        .blog-loader-line--title {
          height: 16px;
          width: 65%;
          margin-bottom: 6px;
        }
        @keyframes blog-loader-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .blog-loader-line { animation-duration: 3s; }
        }
      `}</style>
    </div>
  );
}

export default BlogLoading;
