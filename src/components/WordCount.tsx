import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Clock } from "lucide-react";

interface WordCountProps {
  content: string;
}

// Tiny pulse when a number changes: 120ms scale + color nudge, nothing loud.
function usePulseOnChange<T>(value: T) {
  const [pulse, setPulse] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 160);
    return () => clearTimeout(t);
  }, [value]);
  return pulse;
}

export function WordCount({ content }: WordCountProps) {
  const stats = useMemo(() => {
    const text = (content ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&#8203;|\u200B|\u00A0/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .replace(/[#*_~`>\-\[\]()!|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) return { words: 0, chars: 0, readTime: "" };

    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.replace(/\s/g, "").length;
    if (words === 0) return { words: 0, chars: 0, readTime: "" };
    const totalSeconds = Math.max(1, Math.round((words / 200) * 60));
    const readTime =
      totalSeconds < 60
        ? `${totalSeconds} sec read`
        : `${Math.round(totalSeconds / 60)} min read`;

    return { words, chars, readTime };
  }, [content]);

  const wordsPulse = usePulseOnChange(stats.words);
  const charsPulse = usePulseOnChange(stats.chars);

  const compact = stats.chars > 5000 || stats.words > 5000;
  const pulseCls = "transition-all duration-150 ease-out inline-block";
  const active = "scale-110 text-foreground";
  const rest = "scale-100";

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-4 py-1.5 text-[10px] sm:text-[11px] text-muted-foreground select-none whitespace-nowrap tabular-nums">
      <span className="inline-flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span className={`${pulseCls} ${wordsPulse ? active : rest}`}>{stats.words.toLocaleString()}</span>
        {!compact && (
          <span className="ml-1">{stats.words === 1 ? "word" : "words"}</span>
        )}
      </span>
      <span className="text-border">·</span>
      <span>
        <span className={`${pulseCls} ${charsPulse ? active : rest}`}>{stats.chars.toLocaleString()}</span>
        {!compact && <span className="ml-1">chars</span>}
      </span>
      {stats.readTime && <span className="text-border">·</span>}
      {stats.readTime && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {stats.readTime}
        </span>
      )}
    </div>
  );
}


