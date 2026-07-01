import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";

// Fixed left-hand rail for blog posts: reading progress + section anchors
// pulled live from H2s in the article. Hidden on tablet/mobile, shown only
// on /blog/<slug> routes (not the index).
export function BlogSideRail() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const isBlogPost =
    location.pathname.startsWith("/blog/") && location.pathname !== "/blog";

  useEffect(() => {
    if (!isBlogPost) return;

    // Collect H2s from the article and give each a stable id
    const collect = () => {
      const article = document.querySelector("article.blog-article");
      if (!article) return;
      const h2s = Array.from(article.querySelectorAll("h2"));
      const items = h2s.map((h, i) => {
        if (!h.id) {
          h.id =
            (h.textContent || `section-${i}`)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") || `section-${i}`;
        }
        return { id: h.id, text: h.textContent?.trim() || `Section ${i + 1}` };
      });
      setSections(items);
    };

    const t = setTimeout(collect, 120);
    return () => clearTimeout(t);
  }, [isBlogPost, location.pathname]);

  useEffect(() => {
    if (!isBlogPost) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);

      // active section = last H2 whose top is above 20% viewport
      const article = document.querySelector("article.blog-article");
      if (!article) return;
      const h2s = Array.from(article.querySelectorAll("h2"));
      const threshold = window.innerHeight * 0.2;
      let current: string | null = null;
      for (const h of h2s) {
        const rect = h.getBoundingClientRect();
        if (rect.top <= threshold) current = h.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isBlogPost, sections]);

  if (!isBlogPost) return null;

  return (
    <aside
      aria-label="Article navigation"
      className="hidden xl:flex fixed left-6 top-32 bottom-16 z-30 w-52 flex-col gap-6 pointer-events-none"
    >
      {/* wordmark */}
      <Link
        to="/blog"
        className="pointer-events-auto font-serif text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All posts
      </Link>

      {/* progress rail */}
      <div className="pointer-events-none flex gap-3 flex-1 min-h-0">
        <div className="relative w-px bg-border">
          <div
            className="absolute top-0 left-0 w-px bg-accent transition-[height] duration-150"
            style={{ height: `${progress * 100}%` }}
          />
        </div>

        {/* section list */}
        <nav className="pointer-events-auto flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {sections.length > 0 && (
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              In this post
            </div>
          )}
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(s.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`block text-[12px] leading-snug transition-colors ${
                    active === s.id
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="pointer-events-auto inline-flex items-center gap-2 self-start text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowUp className="h-3 w-3" />
        Back to top
      </button>
    </aside>
  );
}
