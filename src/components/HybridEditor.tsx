import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { X } from "lucide-react";

type Segment =
  | { type: "text"; value: string }
  | { type: "image"; alt: string; src: string; raw: string };

function parseContent(content: string): Segment[] {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: "image", alt: match[1], src: match[2], raw: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: "" });
  }

  if (segments[0].type !== "text") {
    segments.unshift({ type: "text", value: "" });
  }

  if (segments[segments.length - 1].type !== "text") {
    segments.push({ type: "text", value: "" });
  }

  const result: Segment[] = [];
  for (let i = 0; i < segments.length; i++) {
    result.push(segments[i]);
    if (
      segments[i].type === "image" &&
      i + 1 < segments.length &&
      segments[i + 1].type === "image"
    ) {
      result.push({ type: "text", value: "" });
    }
  }

  return result;
}

function reassemble(segments: Segment[]): string {
  return segments
    .map((seg) => (seg.type === "text" ? seg.value : seg.raw))
    .join("");
}

interface HybridEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onTogglePreview?: () => void;
}

export interface HybridEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
  getActiveTextarea: () => HTMLTextAreaElement | null;
}

function wrapSelection(textarea: HTMLTextAreaElement, wrapper: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.substring(start, end);
  const newVal = val.substring(0, start) + wrapper + selected + wrapper + val.substring(end);
  // Set value and cursor after React re-render
  setTimeout(() => {
    textarea.value = newVal;
    textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
    textarea.focus();
  }, 0);
  return newVal;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  onFocus,
  textareaRef,
  onKeyDown,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef || fallbackRef;

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = Math.max(el.scrollHeight, 28) + "px";
  }, [ref]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref as React.RefObject<HTMLTextAreaElement>}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent border-none outline-none resize-none text-foreground leading-relaxed placeholder:text-muted-foreground/40 text-sm sm:text-[15px] font-mono overflow-hidden"
      style={{ minHeight: "28px" }}
    />
  );
}

export const HybridEditor = forwardRef<HybridEditorHandle, HybridEditorProps>(
  ({ content, onChange, placeholder, onTogglePreview }, ref) => {
    const [segments, setSegments] = useState<Segment[]>(() => parseContent(content));
    const lastEmittedRef = useRef(content);
    const activeTextareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaRefsMap = useRef<Map<number, React.RefObject<HTMLTextAreaElement>>>(new Map());

    useEffect(() => {
      if (content !== lastEmittedRef.current) {
        setSegments(parseContent(content));
        lastEmittedRef.current = content;
      }
    }, [content]);

    const getOrCreateRef = (index: number) => {
      if (!textareaRefsMap.current.has(index)) {
        textareaRefsMap.current.set(index, { current: null } as React.RefObject<HTMLTextAreaElement>);
      }
      return textareaRefsMap.current.get(index)!;
    };

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        setSegments((prev) => {
          const segs = [...prev];
          let targetIdx = -1;
          for (const [idx, taRef] of textareaRefsMap.current.entries()) {
            if (taRef.current === activeTextareaRef.current) {
              targetIdx = idx;
              break;
            }
          }
          if (targetIdx === -1 || segs[targetIdx]?.type !== "text") {
            for (let i = segs.length - 1; i >= 0; i--) {
              if (segs[i].type === "text") { targetIdx = i; break; }
            }
          }
          if (targetIdx >= 0 && segs[targetIdx].type === "text") {
            (segs[targetIdx] as { type: "text"; value: string }).value += text;
          }
          const assembled = reassemble(segs);
          lastEmittedRef.current = assembled;
          onChange(assembled);
          return segs;
        });
      },
      getValue: () => reassemble(segments),
      getActiveTextarea: () => activeTextareaRef.current,
    }));

    const handleKeyDown = useCallback((segIndex: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        const ta = textareaRefsMap.current.get(segIndex)?.current;
        if (!ta) return;
        const newVal = wrapSelection(ta, "**");
        setSegments((prev) => {
          const segs = prev.map((s, i) => i === segIndex ? { ...s, value: newVal } : s) as Segment[];
          const assembled = reassemble(segs);
          lastEmittedRef.current = assembled;
          onChange(assembled);
          return segs;
        });
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        const ta = textareaRefsMap.current.get(segIndex)?.current;
        if (!ta) return;
        const newVal = wrapSelection(ta, "_");
        setSegments((prev) => {
          const segs = prev.map((s, i) => i === segIndex ? { ...s, value: newVal } : s) as Segment[];
          const assembled = reassemble(segs);
          lastEmittedRef.current = assembled;
          onChange(assembled);
          return segs;
        });
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        onTogglePreview?.();
      }
    }, [onChange, onTogglePreview]);

    const handleTextChange = useCallback((segIndex: number, newValue: string) => {
      setSegments((prev) => {
        const newSegments = prev.map((seg, i) =>
          i === segIndex ? { ...seg, value: newValue } : seg
        ) as Segment[];
        const assembled = reassemble(newSegments);
        lastEmittedRef.current = assembled;
        onChange(assembled);
        return newSegments;
      });
    }, [onChange]);

    const handleRemoveImage = useCallback((segIndex: number) => {
      setSegments((prev) => {
        const newSegments = prev.filter((_, i) => i !== segIndex);
        const assembled = reassemble(newSegments);
        lastEmittedRef.current = assembled;
        onChange(assembled);
        return newSegments;
      });
    }, [onChange]);

    const handleFocus = useCallback((segIndex: number) => {
      const taRef = textareaRefsMap.current.get(segIndex);
      if (taRef?.current) {
        activeTextareaRef.current = taRef.current;
      }
    }, []);

    return (
      <div className="w-full px-3 sm:px-8 py-4 sm:py-6 min-h-[400px]">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            const taRef = getOrCreateRef(i);
            return (
              <AutoResizeTextarea
                key={`text-${i}`}
                value={seg.value}
                onChange={(val) => handleTextChange(i, val)}
                onFocus={() => handleFocus(i)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                textareaRef={taRef}
                placeholder={i === 0 && segments.length <= 1 ? placeholder : undefined}
              />
            );
          }

          return (
            <div key={`img-${i}`} className="relative group my-3 inline-block max-w-full">
              <img
                src={seg.src}
                alt={seg.alt || ""}
                className="rounded-2xl border border-border shadow-md max-w-full max-h-[400px] h-auto object-contain"
                loading="lazy"
              />
              <button
                onClick={() => handleRemoveImage(i)}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {seg.alt && (
                <span className="absolute bottom-2 left-2 bg-background/80 text-[10px] text-muted-foreground px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {seg.alt}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

HybridEditor.displayName = "HybridEditor";
