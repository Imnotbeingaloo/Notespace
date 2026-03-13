import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Replace, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FindReplaceProps {
  editorRef: React.RefObject<HTMLDivElement>;
  open: boolean;
  onClose: () => void;
}

export function FindReplace({ editorRef, open, onClose }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);

  const clearHighlights = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const marks = editor.querySelectorAll("mark[data-find-highlight]");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });
  }, [editorRef]);

  const highlightMatches = useCallback((searchText: string) => {
    clearHighlights();
    if (!searchText || !editorRef.current) {
      setMatchCount(0);
      setCurrentMatch(0);
      return;
    }

    const editor = editorRef.current;
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    let count = 0;
    const lowerSearch = searchText.toLowerCase();

    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      const lowerText = text.toLowerCase();
      let idx = lowerText.indexOf(lowerSearch);
      if (idx === -1) continue;

      const fragment = document.createDocumentFragment();
      let lastIdx = 0;

      while (idx !== -1) {
        count++;
        if (idx > lastIdx) {
          fragment.appendChild(document.createTextNode(text.slice(lastIdx, idx)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-find-highlight", "true");
        mark.setAttribute("data-match-index", String(count));
        mark.style.backgroundColor = "hsl(var(--primary) / 0.3)";
        mark.style.borderRadius = "2px";
        mark.style.padding = "0 1px";
        mark.textContent = text.slice(idx, idx + searchText.length);
        fragment.appendChild(mark);
        lastIdx = idx + searchText.length;
        idx = lowerText.indexOf(lowerSearch, lastIdx);
      }

      if (lastIdx < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
    }

    setMatchCount(count);
    setCurrentMatch(count > 0 ? 1 : 0);

    // Highlight current match
    if (count > 0) {
      const firstMark = editor.querySelector('mark[data-match-index="1"]');
      if (firstMark) {
        (firstMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.6)";
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [editorRef, clearHighlights]);

  const navigateMatch = useCallback((direction: "next" | "prev") => {
    if (matchCount === 0 || !editorRef.current) return;
    const editor = editorRef.current;

    // Reset current highlight
    const currentMark = editor.querySelector(`mark[data-match-index="${currentMatch}"]`);
    if (currentMark) {
      (currentMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.3)";
    }

    let next = direction === "next" ? currentMatch + 1 : currentMatch - 1;
    if (next > matchCount) next = 1;
    if (next < 1) next = matchCount;
    setCurrentMatch(next);

    const nextMark = editor.querySelector(`mark[data-match-index="${next}"]`);
    if (nextMark) {
      (nextMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.6)";
      nextMark.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatch, matchCount, editorRef]);

  const handleReplace = useCallback(() => {
    if (matchCount === 0 || !editorRef.current) return;
    const editor = editorRef.current;
    const mark = editor.querySelector(`mark[data-match-index="${currentMatch}"]`);
    if (mark) {
      const textNode = document.createTextNode(replaceText);
      mark.parentNode?.replaceChild(textNode, mark);
      textNode.parentNode?.normalize();
      // Re-highlight
      highlightMatches(findText);
      // Trigger input event so editor picks up change
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, [currentMatch, matchCount, replaceText, findText, editorRef, highlightMatches]);

  const handleReplaceAll = useCallback(() => {
    if (matchCount === 0 || !editorRef.current) return;
    const editor = editorRef.current;
    const marks = editor.querySelectorAll("mark[data-find-highlight]");
    marks.forEach((mark) => {
      const textNode = document.createTextNode(replaceText);
      mark.parentNode?.replaceChild(textNode, mark);
    });
    editor.normalize();
    setMatchCount(0);
    setCurrentMatch(0);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }, [matchCount, replaceText, editorRef]);

  useEffect(() => {
    if (open && findInputRef.current) {
      findInputRef.current.focus();
    }
    if (!open) {
      clearHighlights();
      setFindText("");
      setReplaceText("");
      setMatchCount(0);
      setCurrentMatch(0);
    }
  }, [open, clearHighlights]);

  useEffect(() => {
    const timer = setTimeout(() => highlightMatches(findText), 200);
    return () => clearTimeout(timer);
  }, [findText, highlightMatches]);

  if (!open) return null;

  return (
    <div className="shrink-0 border-b border-border bg-muted/30 px-3 py-2 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
      {/* Find row */}
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          ref={findInputRef}
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          placeholder="Find..."
          className="h-7 text-xs flex-1 min-w-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") navigateMatch(e.shiftKey ? "prev" : "next");
            if (e.key === "Escape") onClose();
          }}
        />
        <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
          {matchCount > 0 ? `${currentMatch}/${matchCount}` : "0 results"}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateMatch("prev")} disabled={matchCount === 0}>
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigateMatch("next")} disabled={matchCount === 0}>
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      {/* Replace row */}
      <div className="flex items-center gap-2">
        <Replace className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace..."
          className="h-7 text-xs flex-1 min-w-0"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleReplace();
            if (e.key === "Escape") onClose();
          }}
        />
        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={handleReplace} disabled={matchCount === 0}>
          Replace
        </Button>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={handleReplaceAll} disabled={matchCount === 0}>
          All
        </Button>
      </div>
    </div>
  );
}
