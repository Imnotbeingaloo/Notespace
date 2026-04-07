import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileUp, Loader2, X } from "lucide-react";

interface NewNotePromptProps {
  notebookName: string;
  notebookEmoji: string;
  noteCount: number;
  onCreateNew: () => void;
  onImportAndCreate: (content: string, fileName: string) => void;
}

const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json"];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function NewNotePrompt({ notebookName, notebookEmoji, noteCount, onCreateNew, onImportAndCreate }: NewNotePromptProps) {
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setImportStatus("Unsupported file type. Use .txt, .md, .html, .csv, or .json");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setImporting(true);
    setImportStatus("Reading document...");

    // Simulate realistic loading (at least 5 seconds)
    const startTime = Date.now();

    try {
      const text = await file.text();
      let content = text;
      if (ext === ".html" || ext === ".htm") {
        content = stripHtml(text);
      }

      // Progress stages
      setImportStatus("Parsing content...");
      await new Promise(r => setTimeout(r, 1500));
      setImportStatus("Formatting text...");
      await new Promise(r => setTimeout(r, 1500));
      setImportStatus("Preparing document...");

      // Ensure at least 5 seconds total
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise(r => setTimeout(r, 5000 - elapsed));
      }

      if (content.trim()) {
        onImportAndCreate(content, file.name);
      } else {
        setImportStatus("File appears to be empty.");
        setImporting(false);
      }
    } catch {
      setImportStatus("Failed to read file.");
      setImporting(false);
    }

    if (inputRef.current) inputRef.current.value = "";
  }, [onImportAndCreate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 text-center -mt-16 max-w-sm px-4"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-4xl">{notebookEmoji}</span>
        </div>
        <h2 className="font-sans text-2xl font-bold text-foreground">{notebookName}</h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          {noteCount === 0
            ? "This notebook is empty. Create your first note!"
            : `${noteCount} note${noteCount > 1 ? "s" : ""} — select one to edit.`}
        </p>

        <AnimatePresence mode="wait">
          {!showImport ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3 w-full"
            >
              <button
                onClick={() => setShowImport(true)}
                className="magnetic-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                New Note
              </button>
            </motion.div>
          ) : importing ? (
            <motion.div
              key="importing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{importStatus}</p>
            </motion.div>
          ) : (
            <motion.div
              key="import-options"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-3 w-full"
            >
              <p className="text-sm text-muted-foreground">
                Do you have an existing document you'd like to import?
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="magnetic-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
              >
                <FileUp className="h-4 w-4" />
                Upload Document
              </button>
              <button
                onClick={onCreateNew}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                No, Create Empty Note
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>

              {importStatus && (
                <p className="text-xs text-destructive">{importStatus}</p>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,.markdown,.html,.htm,.csv,.json"
                className="hidden"
                onChange={handleFile}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
