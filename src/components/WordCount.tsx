import { useMemo } from "react";
import { FileText, Clock } from "lucide-react";

interface WordCountProps {
  content: string;
}

export function WordCount({ content }: WordCountProps) {
  const stats = useMemo(() => {
    // 1) Strip HTML tags.
    // 2) Strip blank-line sentinels & zero-width chars.
    // 3) Decode common entities & strip remaining HTML entities.
    // 4) Strip markdown syntax characters.
    // 5) Collapse whitespace and trim.
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
    const minutes = Math.max(1, Math.ceil(words / 200));
    const readTime = minutes === 1 ? "1 min read" : `${minutes} min read`;

    return { words, chars, readTime };
  }, [content]);

  if (stats.words === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 text-[10px] sm:text-[11px] text-muted-foreground select-none">
      <span className="inline-flex items-center gap-1">
        <FileText className="h-3 w-3" />
        {stats.words.toLocaleString()} {stats.words === 1 ? "word" : "words"}
      </span>
      <span className="text-border">·</span>
      <span>{stats.chars.toLocaleString()} chars</span>
      <span className="text-border">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {stats.readTime}
      </span>
    </div>
  );
}
