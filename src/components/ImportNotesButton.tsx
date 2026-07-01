import { useRef, useState, useCallback } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { extractPdfText } from "@/lib/pdf-extract";
import { formatImportedDocument } from "@/lib/document-import";
import { MAX_PROCESSABLE_SIZE } from "@/lib/file-validation";
import { ImportActionDialog, type ImportChoice, type MergePosition } from "@/components/ImportActionDialog";

interface ImportNotesButtonProps {
  /** Insert at cursor / merge into the current note (fallback if onMergeAt missing). */
  onInsert: (text: string) => void;
  /** Optional: merge at a specific position (top / cursor / end). */
  onMergeAt?: (text: string, position: MergePosition) => void;
  /** Optional: replace the entire current note's body. Enables the dialog flow. */
  onReplace?: (text: string) => void;
  /** Optional: spin up a brand-new note with the imported content. */
  onCreateNew?: (text: string, fileName: string) => void;
  /** Whether the current note already has content (drives merge/replace availability). */
  hasExistingContent?: boolean;
}

const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json", ".pdf"];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function humanSize(bytes: number) {
  if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function ImportNotesButton({ onInsert, onMergeAt, onReplace, onCreateNew, hasExistingContent = false }: ImportNotesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<{ content: string; fileName: string } | null>(null);

  const dialogEnabled = !!onReplace || !!onCreateNew;

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({ title: "Unsupported file", description: "Please upload a .txt, .md, .html, .csv, .json, or .pdf file.", variant: "destructive" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 100 MB pre-check: refuse to extract text from very large files because
    // it locks the UI. User can still attach as a binary via FileUpload.
    if (file.size > MAX_PROCESSABLE_SIZE) {
      toast({
        title: "File too large to import",
        description: `"${file.name}" is ${humanSize(file.size)}. Import only works for files under 100 MB. Try attaching it from the paperclip menu instead.`,
        variant: "destructive",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      let content = "";
      if (ext === ".pdf") {
        const { text, isScanned } = await extractPdfText(file);
        if (isScanned || !text.trim()) {
          toast({ title: "Scanned PDF", description: "This PDF does not contain readable text yet.", variant: "destructive" });
          return;
        }
        content = text;
      } else {
        content = await file.text();
      }

      if (ext === ".html" || ext === ".htm") {
        content = stripHtml(content);
      }

      if (!content.trim()) {
        toast({ title: "Empty file", description: "The file appears to be empty.", variant: "destructive" });
        return;
      }

      const formatted = formatImportedDocument(content, file.name);

      if (dialogEnabled && hasExistingContent) {
        // Ask where it should go.
        setPending({ content: formatted, fileName: file.name });
      } else {
        onInsert(`\n${formatted}`);
        toast({ title: "Notes imported", description: `"${file.name}" has been placed in your document.` });
      }
    } catch {
      toast({ title: "Import failed", description: "Could not read the file.", variant: "destructive" });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onInsert, dialogEnabled, hasExistingContent]);

  const handleChoice = useCallback((choice: ImportChoice | null) => {
    if (!pending) { setPending(null); return; }
    const { content, fileName } = pending;
    setPending(null);
    if (!choice) return;
    if (choice.action === "create") {
      onCreateNew?.(content, fileName);
      toast({ title: "New note created", description: `"${fileName}" imported into a new note.` });
    } else if (choice.action === "merge") {
      const pos = choice.position ?? "cursor";
      if (onMergeAt) {
        onMergeAt(content, pos);
      } else {
        onInsert(`\n${content}`);
      }
      const where = pos === "top" ? "at the top" : pos === "end" ? "at the end" : "at your cursor";
      toast({ title: "Merged", description: `"${fileName}" inserted ${where}.` });
    } else if (choice.action === "replace") {
      onReplace?.(content);
      toast({ title: "Note replaced", description: `Content replaced with "${fileName}".` });
    }
  }, [pending, onCreateNew, onInsert, onMergeAt, onReplace]);

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Import notes from a file and place in document"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Import Notes</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,.markdown,.html,.htm,.csv,.json,.pdf,application/pdf"
        className="hidden"
        onChange={handleFile}
      />
      {pending && (
        <ImportActionDialog
          open
          fileName={pending.fileName}
          hasExistingContent={hasExistingContent}
          onChoose={handleChoice}
        />
      )}
    </>
  );
}
