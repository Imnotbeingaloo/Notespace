import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileUp, Loader2, LayoutTemplate, ArrowLeft, LayoutGrid, Eye, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteTemplatePicker, NoteTemplate, templates, FEATURED_TEMPLATE_IDS, TemplatePaper } from "@/components/NoteTemplatePicker";
import { extractPdfText } from "@/lib/pdf-extract";
import { formatImportedDocument } from "@/lib/document-import";

interface NewNotePromptProps {
  notebookName: string;
  notebookEmoji: string;
  noteCount: number;
  onCreateNew: (title?: string, content?: string) => void;
  onImportAndCreate: (content: string, fileName: string) => void;
}

const ALLOWED_EXTENSIONS = [".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json", ".pdf"];

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function NewNotePrompt({ notebookName, notebookEmoji, noteCount, onCreateNew, onImportAndCreate }: NewNotePromptProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  // "main" → starting cards. "featured" → 5 quick templates + gallery gateway. "gallery" → full library.
  const [view, setView] = useState<"main" | "featured" | "gallery">("main");
  const [previewTemplate, setPreviewTemplate] = useState<NoteTemplate | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const featured = useMemo(
    () => FEATURED_TEMPLATE_IDS.map((id) => templates.find((t) => t.id === id)).filter(Boolean) as NoteTemplate[],
    []
  );

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setImportStatus("Unsupported file type. Use .txt, .md, .html, .csv, .json, or .pdf");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setImporting(true);
    setImportStatus(ext === ".pdf" ? "Reading PDF…" : "Reading document…");

    try {
      let content = "";
      if (ext === ".pdf") {
        const { text, isScanned } = await extractPdfText(file, () => setImportStatus("Extracting PDF text…"));
        if (isScanned || !text.trim()) {
          setImportStatus("This PDF looks scanned, so there isn't readable text to import yet.");
          setImporting(false);
          return;
        }
        content = text;
      } else {
        const text = await file.text();
        content = text;
      }

      if (ext === ".html" || ext === ".htm") {
        content = stripHtml(content);
      }

      setImportStatus("Formatting text…");
      const formatted = formatImportedDocument(content, file.name);
      setImportStatus("Adding to notebook…");

      if (formatted.trim()) {
        setUploadDialogOpen(false);
        onImportAndCreate(formatted, file.name);
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
    setView("main");
    setPreviewTemplate(null);
    onCreateNew(template.title, template.content);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-background py-8">
      <AnimatePresence mode="wait">
        {view === "gallery" ? (
          <NoteTemplatePicker
            key="templates"
            onSelect={handleTemplateSelect}
            onBack={() => setView("featured")}
          />
        ) : view === "featured" ? (
          <motion.div
            key="featured"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-8"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">— Quick start —</p>
                <h2 className="font-serif text-2xl font-bold text-foreground">Choose a template</h2>
                <p className="text-xs text-muted-foreground mt-1">Our most-loved layouts to start writing instantly.</p>
              </div>
              <div className="w-10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((tmpl) => (
                <motion.button
                  key={tmpl.id}
                  onClick={() => setPreviewTemplate(tmpl)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex flex-col gap-3 p-3 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-left overflow-hidden"
                >
                  <div className="relative h-40 w-full">
                    <TemplatePaper template={tmpl} compact />
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${tmpl.accent ?? "bg-primary/10 text-primary"}`}>
                      {tmpl.icon}
                    </div>
                  </div>
                  <div className="px-1 pb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setView("gallery")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-dashed border-primary/40 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <LayoutGrid className="h-4 w-4" />
                Choose from Gallery
              </button>
            </div>
          </motion.div>
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
                onClick={() => setView("featured")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-dashed border-primary/30 text-sm font-medium text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <LayoutTemplate className="h-4 w-4" />
                Choose from Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured-view template preview modal (gallery has its own internal preview) */}
      <AnimatePresence>
        {previewTemplate && view === "featured" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${previewTemplate.accent ?? "bg-primary/10 text-primary"}`}>
                    {previewTemplate.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{previewTemplate.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> Preview</p>
                  </div>
                </div>
                <button onClick={() => setPreviewTemplate(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 bg-background/40">
                {previewTemplate.content.trim() ? (
                  <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewTemplate.content}</ReactMarkdown>
                  </article>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-10">
                    A clean, empty page — yours to fill.
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-muted/30">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { const t = previewTemplate; setPreviewTemplate(null); handleTemplateSelect(t); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 hover:opacity-90"
                >
                  <Check className="h-3.5 w-3.5" /> Use this template
                </button>
              </div>
            </motion.div>
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
                    Choose a file to import into your new note. Supported formats: .txt, .md, .html, .csv, .json, .pdf
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
              accept=".txt,.md,.markdown,.html,.htm,.csv,.json,.pdf,application/pdf"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
