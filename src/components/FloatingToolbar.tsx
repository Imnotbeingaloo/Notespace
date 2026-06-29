import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Strikethrough, Code, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingToolbarProps {
  selectionRect: DOMRect | null;
  onAction: (command: string, value?: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const actions = [
  { icon: Bold, command: "bold", label: "Bold" },
  { icon: Italic, command: "italic", label: "Italic" },
  { icon: Strikethrough, command: "strikeThrough", label: "Strikethrough" },
  { icon: Code, command: "code", label: "Code" },
  { icon: Link2, command: "createLink", label: "Link" },
];

export function FloatingToolbar({ selectionRect, onAction, containerRef }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!selectionRect || !containerRef.current) {
      setPosition(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const toolbarWidth = 200;
    const toolbarHeight = 40;

    let left = selectionRect.left + selectionRect.width / 2 - containerRect.left - toolbarWidth / 2;
    let top = selectionRect.top - containerRect.top - toolbarHeight - 8;

    // Clamp horizontal position
    left = Math.max(0, Math.min(left, containerRect.width - toolbarWidth));

    // If would go above container, put below selection
    if (top < 0) {
      top = selectionRect.bottom - containerRect.top + 8;
    }

    setPosition({ top, left });
  }, [selectionRect, containerRef]);

  const handleAction = (command: string) => {
    if (command === "code") {
      // Wrap in <code> tag
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const selected = range.toString();
      const codeEl = document.createElement("code");
      codeEl.textContent = selected || "code";
      range.deleteContents();
      range.insertNode(codeEl);
      range.setStartAfter(codeEl);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      containerRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    if (command === "createLink") {
      const rawUrl = prompt("Enter URL:", "https://");
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) return;
      onAction(command, safeUrl);
      return;
    }

    onAction(command);
  };

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-xl border border-border bg-popover shadow-lg"
          style={{ top: position.top, left: position.left }}
          onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
        >
          {actions.map((a) => (
            <button
              key={a.command}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleAction(a.command);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
              title={a.label}
            >
              <a.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
