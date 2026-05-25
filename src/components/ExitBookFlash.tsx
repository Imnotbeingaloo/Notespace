import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

/**
 * Minimal book flash shown when navigating from the app back to the marketing
 * site. Uses a pure CSS keyframe so the fade is driven by the compositor and
 * is NOT blocked while the (heavy) Landing page is mounting/hydrating.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Fallback removal in case animationend never fires.
    const t = window.setTimeout(() => {
      setHidden(true);
      onDone();
    }, 700);
    return () => clearTimeout(t);
  }, [onDone]);

  if (hidden) return null;

  return (
    <div
      aria-hidden
      onAnimationEnd={() => {
        setHidden(true);
        onDone();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background pointer-events-none"
      style={{
        animation: "exit-book-fade 500ms ease-out forwards",
      }}
    >
      <BookOpen className="h-12 w-12 text-primary" strokeWidth={1.75} />
      <style>{`
        @keyframes exit-book-fade {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
