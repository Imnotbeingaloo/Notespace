import { useRef, useState, useCallback } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImportNotesButtonProps {
  onInsert: (text: string) => void;
}

const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json"];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function ImportNotesButton({ onInsert }: ImportNotesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({ title: "Unsupported file", description: "Please upload a .txt, .md, .html, .csv, or .json file.", variant: "destructive" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      let content = text;

      if (ext === ".html" || ext === ".htm") {
        content = stripHtml(text);
      }

      if (content.trim()) {
        onInsert(`\n## Imported: ${file.name}\n\n${content}\n`);
        toast({ title: "Notes imported", description: `"${file.name}" has been placed in your document.` });
      } else {
        toast({ title: "Empty file", description: "The file appears to be empty.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Import failed", description: "Could not read the file.", variant: "destructive" });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onInsert]);

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
        accept=".txt,.md,.markdown,.html,.htm,.csv,.json"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
