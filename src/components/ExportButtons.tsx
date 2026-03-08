import { Download, FileText } from "lucide-react";
import { useNotebooks } from "@/context/NotebookContext";

export function ExportButtons() {
  const { activeNote } = useNotebooks();
  if (!activeNote) return null;

  const exportMarkdown = () => {
    const content = `# ${activeNote.title}\n\n${activeNote.content}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title || "note"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    // Convert basic markdown to HTML for print
    const htmlContent = activeNote.content
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/^- (.*$)/gim, "<li>$1</li>")
      .replace(/\n/g, "<br>");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeNote.title}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; line-height: 1.7; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          h2 { font-size: 22px; margin-top: 24px; }
          h3 { font-size: 18px; margin-top: 20px; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
          li { margin-left: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${activeNote.title}</h1>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
        ${htmlContent}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={exportMarkdown}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Export as Markdown"
      >
        <FileText className="h-3.5 w-3.5" />
        .md
      </button>
      <button
        onClick={exportPDF}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Export as PDF"
      >
        <Download className="h-3.5 w-3.5" />
        PDF
      </button>
    </div>
  );
}
