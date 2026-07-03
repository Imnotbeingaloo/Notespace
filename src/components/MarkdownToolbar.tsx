import { useCallback, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Quote, Code, Link2, Image, Strikethrough, Minus, Highlighter, Loader2 } from
"lucide-react";
import { ListStylePicker } from "@/components/ListStylePicker";
import { AlignmentPicker } from "@/components/AlignmentPicker";
import { TableInsert } from "@/components/TableInsert";
import { TableEditToolbar } from "@/components/TableEditToolbar";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { validateFile, buildStoragePath } from "@/lib/file-validation";
import { toast } from "@/hooks/use-toast";
import { LinkInsertDialog } from "@/components/LinkInsertDialog";
import { sanitizeUrl, escapeHtmlAttr } from "@/lib/url-sanitize";
import { useLastHighlightColor } from "@/hooks/use-last-highlight-color";

interface MarkdownToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onFindReplace?: () => void;
  children?: React.ReactNode;
}

type FormatAction = {
  icon: React.ElementType;
  label: string;
  action: () => void;
};

// Group separators: after Highlight (idx 3), after H3 (idx 6), after Code (idx 7)
const separatorAfter = new Set([3, 6, 7]);

function focusEditor(el: HTMLDivElement | null) {
  if (el) el.focus();
}

export function MarkdownToolbar({ editorRef, onFindReplace, children }: MarkdownToolbarProps) {
  const exec = useCallback((command: string, value?: string) => {
    focusEditor(editorRef.current);
    document.execCommand(command, false, value);
  }, [editorRef]);

  const wrapWithTag = useCallback((tag: string) => {
    focusEditor(editorRef.current);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const selected = sel.toString();
    const safe = (selected || "code")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Use execCommand so the action stays on the browser's native undo stack
    document.execCommand("insertHTML", false, `<${tag}>${safe}</${tag}>`);
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState("");
  const [linkInitialUrl, setLinkInitialUrl] = useState("");
  const savedRangeRef = useRef<Range | null>(null);

  const insertLink = useCallback(() => {
    focusEditor(editorRef.current);
    const sel = window.getSelection();
    const selected = sel?.toString() || "";
    // Save the current range so we can restore the selection when the dialog closes.
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    // If user clicked inside an existing <a>, prefill its href.
    let existingHref = "";
    const anchorNode = sel?.anchorNode as Node | null;
    if (anchorNode) {
      let el: HTMLElement | null = anchorNode.nodeType === 1
        ? (anchorNode as HTMLElement)
        : (anchorNode.parentElement as HTMLElement | null);
      while (el && el !== editorRef.current) {
        if (el.tagName === "A") { existingHref = (el as HTMLAnchorElement).getAttribute("href") || ""; break; }
        el = el.parentElement;
      }
    }
    setLinkInitialText(selected);
    setLinkInitialUrl(existingHref);
    setLinkDialogOpen(true);
  }, [editorRef]);

  const confirmLink = useCallback((title: string, url: string) => {
    setLinkDialogOpen(false);
    focusEditor(editorRef.current);
    // Restore the saved selection so insertHTML lands in the right place.
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    const safeUrl = url.replace(/"/g, "&quot;");
    const safeTitle = (title || url)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const html = `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a>`;
    document.execCommand("insertHTML", false, html);
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
    savedRangeRef.current = null;
  }, [editorRef]);

  const { user } = useAuth();
  const { activeNote, activeNotebookId, updateNote } = useNotebooks();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const insertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeNote || !activeNotebookId) {
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      // Fall back to URL prompt for non-images
      if (imageInputRef.current) imageInputRef.current.value = "";
      const rawUrl = prompt("Enter image URL:");
      const safeUrl = sanitizeUrl(rawUrl);
      if (!safeUrl) {
        if (rawUrl) toast({ title: "That URL isn't allowed", variant: "destructive" });
        return;
      }
      focusEditor(editorRef.current);
      document.execCommand("insertHTML", false, `<img src="${escapeHtmlAttr(safeUrl)}" alt="image" class="rounded-2xl border border-border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3" loading="lazy" />`);
      editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
      return;
      return;
    }
    if (!validateFile(file)) {
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setUploadingImage(true);
    try {
      const path = buildStoragePath(user.id, activeNote.id, file.name);
      const { error } = await supabase.storage.from("note-attachments").upload(path, file);
      if (error) throw error;
      const { data: signedUrlData } = await supabase.storage
        .from("note-attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      const fileUrl = signedUrlData?.signedUrl || "";

      const newAttachments = [
        ...(activeNote.attachments || []),
        { name: file.name, url: fileUrl, path, type: file.type, size: file.size },
      ];
      await updateNote(activeNotebookId, activeNote.id, { attachments: newAttachments });

      focusEditor(editorRef.current);
      const html = `<img src="${fileUrl}" alt="${file.name}" class="rounded-2xl border border-border shadow-md max-w-full max-h-[400px] h-auto object-contain my-3" loading="lazy" />`;
      document.execCommand("insertHTML", false, html);
      editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
      toast({ title: "Image inserted", description: file.name });
    } catch (err: any) {
      toast({ title: "Image upload failed", description: err.message || "Try again.", variant: "destructive" as any });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [user, activeNote, activeNotebookId, updateNote, editorRef]);

  const insertDivider = useCallback(() => {
    focusEditor(editorRef.current);
    document.execCommand("insertHTML", false, '<hr class="my-4 border-0 h-[2px] bg-foreground/30 dark:bg-foreground/40 rounded" /><p><br></p>');
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  // Apply highlight ONLY when there is a selection so it doesn't leak into newly typed text.
  const applyHighlight = useCallback((color: string) => {
    focusEditor(editorRef.current);
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      toast({ title: "Select some text first", description: "Highlighting only applies to a selection." });
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.style.borderRadius = "2px";
    span.style.padding = "0 2px";
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const after = document.createRange();
      after.setStartAfter(span);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    } catch {/* ignore */}
    editorRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [editorRef]);

  const HIGHLIGHT_COLORS = [
    { name: "Yellow", value: "#fde68a" },
    { name: "Green", value: "#bbf7d0" },
    { name: "Blue", value: "#bfdbfe" },
    { name: "Pink", value: "#fbcfe8" },
    { name: "Purple", value: "#ddd6fe" },
    { name: "Orange", value: "#fed7aa" },
  ];

  const [lastHighlightColor, setLastHighlightColor] = useLastHighlightColor();

  const actions: FormatAction[] = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Strikethrough, label: "Strikethrough", action: () => exec("strikeThrough") },
    { icon: Highlighter, label: "Highlight", action: () => {} },
    { icon: Heading1, label: "Heading 1", action: () => exec("formatBlock", "<h1>") },
    { icon: Heading2, label: "Heading 2", action: () => exec("formatBlock", "<h2>") },
    { icon: Heading3, label: "Heading 3", action: () => exec("formatBlock", "<h3>") },
    { icon: Quote, label: "Blockquote", action: () => exec("formatBlock", "<blockquote>") },
    { icon: Code, label: "Inline Code", action: () => wrapWithTag("code") },
    { icon: Link2, label: "Link", action: insertLink },
    { icon: uploadingImage ? Loader2 : Image, label: uploadingImage ? "Uploading image…" : "Image (upload or URL)", action: insertImage },
    { icon: Minus, label: "Divider", action: insertDivider },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="relative flex items-center">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <LinkInsertDialog
        open={linkDialogOpen}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
        onCancel={() => setLinkDialogOpen(false)}
        onConfirm={confirmLink}
      />
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 p-1 rounded-r-lg bg-background/90 border-r border-border text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div ref={scrollRef} className="flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-none">
        {actions.map((a, i) =>
        <div key={a.label} className="contents">
            {a.label === "Highlight" ? (
              <Popover>
                <div className="flex items-center flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.preventDefault(); applyHighlight(lastHighlightColor); }}
                        className="p-1.5 rounded-l-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 relative"
                        aria-label="Highlight with last color"
                      >
                        <Highlighter className="h-4 w-4" />
                        <span
                          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-3.5 rounded-sm border border-border/60"
                          style={{ backgroundColor: lastHighlightColor }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Highlight (click swatch for colors)</TooltipContent>
                  </Tooltip>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      className="px-1 py-1.5 rounded-r-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 text-[9px] leading-none"
                      aria-label="Choose highlight color"
                    >
                      ▾
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent className="w-auto p-2" align="start" sideOffset={6} onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="flex items-center gap-1.5">
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setLastHighlightColor(c.value); applyHighlight(c.value); }}
                        className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
                          lastHighlightColor === c.value ? "border-foreground ring-2 ring-primary/40" : "border-border"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                        aria-label={`Highlight ${c.name}`}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      a.action();
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
                    aria-label={a.label}>
                    <a.icon className={`h-4 w-4 ${a.icon === Loader2 ? "animate-spin" : ""}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{a.label}</TooltipContent>
              </Tooltip>
            )}
            {separatorAfter.has(i) &&
          <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
          }
          </div>
        )}
        {/* List styles dropdown */}
        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
        <ListStylePicker editorRef={editorRef} />
        {/* Alignment dropdown */}
        <AlignmentPicker editorRef={editorRef} />
        {/* Table insertion & editing */}
        <TableInsert editorRef={editorRef} />
        <TableEditToolbar editorRef={editorRef} />
        <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
        {children}
        {onFindReplace && (
          <>
            <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onFindReplace}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
                  aria-label="Find & Replace"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Find & Replace (Ctrl+F)</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 p-1 rounded-l-lg bg-background/90 border-l border-border text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
    </TooltipProvider>);
}
