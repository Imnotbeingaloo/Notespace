import { ReactNode } from "react";

// Full-bleed section for blog posts. Breaks out of the max-w-3xl reading
// column so tables, CTAs and pull quotes get a wide/dark band instead of
// living inside the same narrow gutter as body copy.
//
// Uses viewport-based negative margin trick — works inside any centered
// container without knowing its width. tone controls the band color.
export function BlogBleed({
  children,
  tone = "muted",
  inner = "narrow",
}: {
  children: ReactNode;
  tone?: "muted" | "dark" | "brass" | "none";
  /** narrow = keep contents readable; wide = span full breakout width. */
  inner?: "narrow" | "wide";
}) {
  const bandBg =
    tone === "dark"   ? "bg-foreground text-background"
    : tone === "brass"? "bg-accent/10"
    : tone === "muted"? "bg-muted/60"
    : "";

  return (
    <div
      className={`not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen my-10 ${bandBg}`}
    >
      <div
        className={`mx-auto px-6 py-10 md:py-14 ${
          inner === "wide" ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default BlogBleed;
