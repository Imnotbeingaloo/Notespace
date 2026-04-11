import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileUp, Loader2, LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteTemplatePicker, NoteTemplate } from "@/components/NoteTemplatePicker";

interface NewNotePromptProps {
  notebookName: string;
  notebookEmoji: string;
  noteCount: number;
  onCreateNew: (title?: string, content?: string) => void;
  onImportAndCreate: (content: string, fileName: string) => void;
}

const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json"];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function NewNotePrompt({ notebookName, notebookEmoji, noteCount, onCreateNew, onImportAndCreate }: NewNotePromptProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
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

    const startTime = Date.now();

    try {
      const text = await file.text();
      let content = text;
      if (ext === ".html" || ext === ".htm") {
        content = stripHtml(text);
      }

      setImportStatus("Parsing content...");
      await new Promise(r => setTimeout(r, 1500));
      setImportStatus("Formatting text...");
      await new Promise(r => setTimeout(r, 1500));
      setImportStatus("Preparing document...");

      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise(r => setTimeout(r, 5000 - elapsed));
      }

      if (content.trim()) {
        setUploadDialogOpen(false);
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

  const handleOpenUploadDialog = () => {
    setImporting(false);
    setImportStatus("");
    setUploadDialogOpen(true);
  };

  const handleTemplateSelect = (template: NoteTemplate) => {
    setShowTemplates(false);
    onCreateNew(template.title, template.content);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-background">
      <AnimatePresence mode="wait">
        {showTemplates ? (
          <NoteTemplatePicker
            key="templates"
            onSelect={handleTemplateSelect}
            onBack={() => setShowTemplates(false)}
          />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleOpenUploadDialog}
                className="magnetic-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20"
              >
                <FileUp className="h-4 w-4" />
                Upload a Document
              </button>
              <button
                onClick={() => onCreateNew()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create a New Note
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-dashed border-primary/30 text-sm font-medium text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <LayoutTemplate className="h-4 w-4" />
                Use a Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload a Document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <AnimatePresence mode="wait">
              {importing ? (
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
                  key="upload-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <p className="text-sm text-muted-foreground text-center">
                    Choose a file to import into your new note. Supported formats: .txt, .md, .html, .csv, .json
                  </p>
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="magnetic-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/20 w-full"
                  >
                    <FileUp className="h-4 w-4" />
                    Choose File
                  </button>
                  {importStatus && (
                    <p className="text-xs text-destructive">{importStatus}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.md,.markdown,.html,.htm,.csv,.json"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
