import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

/**
 * Minimal, no-animation exit flash shown when the user navigates from the app
 * back to the marketing site. Just a centered book icon for ~220ms.
 */
export function ExitBookFlash({ onDone }: { onDone: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fade = window.setTimeout(() => setFadingOut(true), 200);
    const done = window.setTimeout(onDone, 380);
    return () => { clearTimeout(fade); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-150"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <BookOpen className="h-12 w-12 text-primary" strokeWidth={1.75} />
    </div>
  );
}
