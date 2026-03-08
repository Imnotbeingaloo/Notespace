import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
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

  // Always have at least one text segment
  if (segments.length === 0) {
    segments.push({ type: "text", value: "" });
  }

  // Ensure first segment is text (for typing before first image)
  if (segments[0].type !== "text") {
    segments.unshift({ type: "text", value: "" });
  }

  // Ensure last segment is text (for typing after last image)
  if (segments[segments.length - 1].type !== "text") {
    segments.push({ type: "text", value: "" });
  }

  // Ensure text segments between consecutive images
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
}

export interface HybridEditorHandle {
  insertAtCursor: (text: string) => void;
  getValue: () => string;
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  autoFocus,
  onKeyDown,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0";
    el.style.height = Math.max(el.scrollHeight, 28) + "px";
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent border-none outline-none resize-none text-foreground leading-relaxed placeholder:text-muted-foreground/40 text-sm sm:text-[15px] font-mono overflow-hidden"
      style={{ minHeight: "28px" }}
    />
  );
}

export const HybridEditor = forwardRef<HybridEditorHandle, HybridEditorProps>(
  ({ content, onChange, placeholder }, ref) => {
    const segmentsRef = useRef<Segment[]>(parseContent(content));
    const activeTextIndex = useRef<number>(0);

    // Re-parse when content changes externally
    useEffect(() => {
      segmentsRef.current = parseContent(content);
    }, [content]);

    const segments = parseContent(content);

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        // Insert at the last active text segment
        const segs = [...segmentsRef.current];
        const idx = activeTextIndex.current;
        const textSegs = segs.filter((s) => s.type === "text");
        if (textSegs.length > 0) {
          const targetIdx = Math.min(idx, textSegs.length - 1);
          let count = 0;
          for (let i = 0; i < segs.length; i++) {
            if (segs[i].type === "text") {
              if (count === targetIdx) {
                (segs[i] as { type: "text"; value: string }).value += text;
                break;
              }
              count++;
            }
          }
        }
        segmentsRef.current = segs;
        onChange(reassemble(segs));
      },
      getValue: () => reassemble(segmentsRef.current),
    }));

    const handleTextChange = (segIndex: number, newValue: string) => {
      const newSegments = segments.map((seg, i) =>
        i === segIndex ? { ...seg, value: newValue } : seg
      ) as Segment[];
      segmentsRef.current = newSegments;

      // Track which text segment is active
      let textCount = 0;
      for (let i = 0; i <= segIndex; i++) {
        if (segments[i].type === "text") textCount++;
      }
      activeTextIndex.current = textCount - 1;

      onChange(reassemble(newSegments));
    };

    const handleRemoveImage = (segIndex: number) => {
      const newSegments = segments.filter((_, i) => i !== segIndex);
      segmentsRef.current = newSegments;
      onChange(reassemble(newSegments));
    };

    return (
      <div className="w-full px-3 sm:px-8 py-4 sm:py-6 min-h-[400px]">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <AutoResizeTextarea
                key={`text-${i}`}
                value={seg.value}
                onChange={(val) => handleTextChange(i, val)}
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
