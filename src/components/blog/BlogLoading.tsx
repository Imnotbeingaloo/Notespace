// Blog route loader. Single monochrome ring spinner — simple, slightly larger
// than a standard spinner so it holds the page while the article code-splits in.
export function BlogLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div
        className="blog-loader-ring"
        role="status"
        aria-label="Loading article"
      />
      <span className="sr-only">Loading article…</span>
      <style>{`
        .blog-loader-ring {
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          border: 2px solid hsl(var(--foreground) / 0.12);
          border-top-color: hsl(var(--foreground) / 0.72);
          animation: blog-loader-spin 0.9s linear infinite;
        }
        @keyframes blog-loader-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .blog-loader-ring { animation-duration: 2.4s; }
        }
      `}</style>
    </div>
  );
}

export default BlogLoading;
