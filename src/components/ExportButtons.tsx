import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { useNotebooks } from "@/context/NotebookContext";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, { FORBID_TAGS: ["script", "style", "iframe", "object", "embed"], FORBID_ATTR: ["onerror", "onload", "onclick"] });

export function ExportButtons() {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!activeNote) return null;

  const title = activeNote.title || "note";
  const content = activeNote.content || "";

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportMarkdown = () => {
    downloadBlob(new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" }), `${title}.md`);
  };

  const exportTxt = () => {
    downloadBlob(new Blob([`${title}\n${"=".repeat(title.length)}\n\n${content}`], { type: "text/plain" }), `${title}.txt`);
  };

  const exportHtml = () => {
    const safeTitle = escapeHtml(title);
    const htmlContent = contentToHtml(title, content);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.7;}h1{font-size:28px;}h2{font-size:22px;}h3{font-size:18px;}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:0.9em;}li{margin-left:20px;}</style></head><body><h1>${safeTitle}</h1><hr>${htmlContent}</body></html>`;
    downloadBlob(new Blob([fullHtml], { type: "text/html" }), `${title}.html`);
  };

  const exportDocx = () => {
    const safeTitle = escapeHtml(title);
    const htmlContent = contentToHtml(title, content);
    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${safeTitle}</title><style>body{font-family:'Calibri',sans-serif;line-height:1.6;color:#222;}h1{font-size:24pt;}h2{font-size:18pt;}h3{font-size:14pt;}code{background:#f0f0f0;padding:2px 4px;border-radius:3px;font-family:'Consolas',monospace;}</style></head><body>${htmlContent}</body></html>`;
    downloadBlob(new Blob([docHtml], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), `${title}.docx`);
  };

  const exportRtf = () => {
    const plainContent = content.replace(/[#*`_~\[\]]/g, "");
    const rtfContent = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}}\n\\f0\\fs24 ${title}\\par\\par\n${plainContent.replace(/\n/g, "\\par\n")}\\par\n}`;
    downloadBlob(new Blob([rtfContent], { type: "application/rtf" }), `${title}.rtf`);
  };

  const exportOdt = () => {
    const safeTitle = escapeHtml(title);
    const safeContent = escapeHtml(content);
    const odtXml = `<?xml version="1.0" encoding="UTF-8"?><office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:mimetype="application/vnd.oasis.opendocument.text" office:version="1.2"><office:body><office:text><text:p>${safeTitle}</text:p><text:p>${safeContent.replace(/\n/g, "</text:p><text:p>")}</text:p></office:text></office:body></office:document>`;
    downloadBlob(new Blob([odtXml], { type: "application/vnd.oasis.opendocument.text" }), `${title}.odt`);
  };

  const exportEpub = () => {
    const safeTitle = escapeHtml(title);
    const htmlContent = contentToHtml(title, content);
    const xhtml = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${safeTitle}</title></head><body><h1>${safeTitle}</h1>${htmlContent}</body></html>`;
    downloadBlob(new Blob([xhtml], { type: "application/epub+zip" }), `${title}.epub`);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const safeTitle = escapeHtml(title);
    const htmlContent = contentToHtml(title, content);
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${safeTitle}</title><style>body{font-family:'Inter',system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a2e;line-height:1.7;}h1{font-size:28px;margin-bottom:8px;}h2{font-size:22px;margin-top:24px;}h3{font-size:18px;margin-top:20px;}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:0.9em;}li{margin-left:20px;}@media print{body{margin:0;}}</style></head><body><h1>${safeTitle}</h1><hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0;">${htmlContent}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
    setOpen(false);
  };

  const formats = [
    { label: "PDF (.pdf)", action: exportPDF },
    { label: "Microsoft Word (.docx)", action: exportDocx },
    { label: "Plain Text (.txt)", action: exportTxt },
    { label: "Markdown (.md)", action: exportMarkdown },
    { label: "Rich Text (.rtf)", action: exportRtf },
    { label: "Web Page (.html)", action: exportHtml },
    { label: "OpenDocument (.odt)", action: exportOdt },
    { label: "EPUB (.epub)", action: exportEpub },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40 hover:shadow-sm transition-all duration-200 w-full"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Download</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ml-auto ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-popover p-1 shadow-lg"
          >
            {formats.map((f) => (
              <button
                key={f.label}
                onClick={f.action}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-popover-foreground rounded-lg hover:bg-muted transition-colors text-left"
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function contentToHtml(_title: string, content: string): string {
  const escaped = escapeHtml(content);
  const html = escaped
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\n/g, "<br>");
  return sanitizeHtml(html);
}
