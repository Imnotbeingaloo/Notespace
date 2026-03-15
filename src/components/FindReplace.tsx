import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Replace, X, ChevronDown, ChevronUp, CaseSensitive, Regex } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [regexError, setRegexError] = useState("");
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
    setRegexError("");
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
    let getMatches: (text: string) => { start: number; length: number }[];

    if (useRegex) {
      let regex: RegExp;
      try {
        regex = new RegExp(searchText, caseSensitive ? "g" : "gi");
      } catch (e: any) {
        setRegexError(e.message || "Invalid regex");
        setMatchCount(0);
        setCurrentMatch(0);
        return;
      }
      getMatches = (text: string) => {
        const results: { start: number; length: number }[] = [];
        let m: RegExpExecArray | null;
        regex.lastIndex = 0;
        while ((m = regex.exec(text)) !== null) {
          if (m[0].length === 0) { regex.lastIndex++; continue; }
          results.push({ start: m.index, length: m[0].length });
        }
        return results;
      };
    } else {
      const needle = caseSensitive ? searchText : searchText.toLowerCase();
      getMatches = (text: string) => {
        const haystack = caseSensitive ? text : text.toLowerCase();
        const results: { start: number; length: number }[] = [];
        let idx = haystack.indexOf(needle);
        while (idx !== -1) {
          results.push({ start: idx, length: searchText.length });
          idx = haystack.indexOf(needle, idx + searchText.length);
        }
        return results;
      };
    }

    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      const matches = getMatches(text);
      if (matches.length === 0) continue;

      const fragment = document.createDocumentFragment();
      let lastIdx = 0;

      for (const match of matches) {
        count++;
        if (match.start > lastIdx) {
          fragment.appendChild(document.createTextNode(text.slice(lastIdx, match.start)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-find-highlight", "true");
        mark.setAttribute("data-match-index", String(count));
        mark.style.backgroundColor = "hsl(var(--primary) / 0.25)";
        mark.style.borderRadius = "3px";
        mark.style.padding = "1px 2px";
        mark.style.boxShadow = "0 0 0 1px hsl(var(--primary) / 0.15)";
        mark.textContent = text.slice(match.start, match.start + match.length);
        fragment.appendChild(mark);
        lastIdx = match.start + match.length;
      }

      if (lastIdx < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
      }

      textNode.parentNode?.replaceChild(fragment, textNode);
    }

    setMatchCount(count);
    setCurrentMatch(count > 0 ? 1 : 0);

    if (count > 0) {
      const firstMark = editor.querySelector('mark[data-match-index="1"]');
      if (firstMark) {
        (firstMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.5)";
        (firstMark as HTMLElement).style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.3)";
        firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [editorRef, clearHighlights, caseSensitive, useRegex]);

  const navigateMatch = useCallback((direction: "next" | "prev") => {
    if (matchCount === 0 || !editorRef.current) return;
    const editor = editorRef.current;

    const currentMark = editor.querySelector(`mark[data-match-index="${currentMatch}"]`);
    if (currentMark) {
      (currentMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.25)";
      (currentMark as HTMLElement).style.boxShadow = "0 0 0 1px hsl(var(--primary) / 0.15)";
    }

    let next = direction === "next" ? currentMatch + 1 : currentMatch - 1;
    if (next > matchCount) next = 1;
    if (next < 1) next = matchCount;
    setCurrentMatch(next);

    const nextMark = editor.querySelector(`mark[data-match-index="${next}"]`);
    if (nextMark) {
      (nextMark as HTMLElement).style.backgroundColor = "hsl(var(--primary) / 0.5)";
      (nextMark as HTMLElement).style.boxShadow = "0 0 0 2px hsl(var(--primary) / 0.3)";
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
      highlightMatches(findText);
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
      setRegexError("");
    }
  }, [open, clearHighlights]);

  useEffect(() => {
    const timer = setTimeout(() => highlightMatches(findText), 200);
    return () => clearTimeout(timer);
  }, [findText, highlightMatches, caseSensitive, useRegex]);

  if (!open) return null;

  return (
    <TooltipProvider>
      <div className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 animate-in slide-in-from-top-2 duration-200 shadow-sm">
        <div className="flex flex-col gap-2.5 max-w-2xl">
          {/* Find row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <Search className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Find</span>
            </div>
            <div className="flex-1 relative">
              <Input
                ref={findInputRef}
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder={useRegex ? "Regex pattern..." : "Search in note..."}
                className={`h-8 text-sm pr-20 ${regexError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigateMatch(e.shiftKey ? "prev" : "next");
                  if (e.key === "Escape") onClose();
                }}
              />
              {/* Match count badge inside input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                  {regexError ? (
                    <span className="text-destructive">Invalid regex</span>
                  ) : matchCount > 0 ? (
                    `${currentMatch} of ${matchCount}`
                  ) : findText ? (
                    "No results"
                  ) : null}
                </span>
              </div>
            </div>
            {/* Options */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={caseSensitive ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setCaseSensitive((p) => !p)}
                  >
                    <CaseSensitive className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Match Case</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={useRegex ? "default" : "ghost"}
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setUseRegex((p) => !p)}
                  >
                    <Regex className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Use Regex</p></TooltipContent>
              </Tooltip>
            </div>
            {/* Nav */}
            <div className="flex items-center gap-0.5 border-l border-border pl-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMatch("prev")} disabled={matchCount === 0}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMatch("next")} disabled={matchCount === 0}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Replace row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
              <Replace className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">Replace</span>
            </div>
            <Input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="h-8 text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReplace();
                if (e.key === "Escape") onClose();
              }}
            />
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={handleReplace} disabled={matchCount === 0}>
                Replace
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={handleReplaceAll} disabled={matchCount === 0}>
                Replace All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
