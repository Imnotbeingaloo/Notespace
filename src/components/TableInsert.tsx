import { useState, useCallback } from "react";
import { Table2, Plus, Minus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TableInsertProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export function TableInsert({ editorRef }: TableInsertProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverRow, setHoverRow] = useState(-1);
  const [hoverCol, setHoverCol] = useState(-1);

  const insertTable = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const bodyRows = Math.max(1, rows);
    let html = '<table style="border-collapse:collapse;width:100%"><thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += `<th style="border:1px solid hsl(var(--border));padding:8px 12px;text-align:left">Header ${c + 1}</th>`;
    }
    html += "</tr></thead><tbody>";
    for (let r = 0; r < bodyRows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="border:1px solid hsl(var(--border));padding:8px 12px">&nbsp;</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";

    document.execCommand("insertHTML", false, html);
    editorRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    setOpen(false);
  }, [editorRef, rows, cols]);

  const gridInsert = useCallback((r: number, c: number) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let html = '<table style="border-collapse:collapse;width:100%"><thead><tr>';
    for (let ci = 0; ci <= c; ci++) {
      html += `<th style="border:1px solid hsl(var(--border));padding:8px 12px;text-align:left">Header ${ci + 1}</th>`;
    }
    html += "</tr></thead><tbody>";
    // Always render at least 1 body row so the table doesn't look empty after insertion.
    const bodyRows = Math.max(1, r + 1);
    for (let ri = 0; ri < bodyRows; ri++) {
      html += "<tr>";
      for (let ci = 0; ci <= c; ci++) {
        html += `<td style="border:1px solid hsl(var(--border));padding:8px 12px">&nbsp;</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";

    document.execCommand("insertHTML", false, html);
    editorRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    setOpen(false);
  }, [editorRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
          title="Insert Table"
        >
          <Table2 className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start" sideOffset={8}>
        <p className="text-xs font-medium text-foreground mb-2">Insert Table</p>

        {/* Quick grid picker */}
        <div className="mb-3">
          <div className="grid grid-cols-6 gap-0.5">
            {Array.from({ length: 36 }, (_, i) => {
              const r = Math.floor(i / 6);
              const c = i % 6;
              const active = r <= hoverRow && c <= hoverCol;
              return (
                <button
                  key={i}
                  onMouseEnter={() => { setHoverRow(r); setHoverCol(c); }}
                  onMouseLeave={() => { setHoverRow(-1); setHoverCol(-1); }}
                  onClick={() => gridInsert(r, c)}
                  className={`h-5 w-full rounded-sm border transition-colors ${
                    active
                      ? "bg-primary/20 border-primary/40"
                      : "bg-muted/50 border-border hover:border-muted-foreground/30"
                  }`}
                />
              );
            })}
          </div>
          {hoverRow >= 0 && hoverCol >= 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              {hoverRow + 1} × {hoverCol + 1} table
            </p>
          )}
        </div>

        <div className="border-t border-border pt-2">
          <p className="text-[10px] text-muted-foreground mb-2">Or specify size:</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-8">Rows</span>
              <button onClick={() => setRows(Math.max(1, rows - 1))} className="p-0.5 rounded hover:bg-muted">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </button>
              <span className="text-xs font-medium w-4 text-center text-foreground">{rows}</span>
              <button onClick={() => setRows(Math.min(20, rows + 1))} className="p-0.5 rounded hover:bg-muted">
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-8">Cols</span>
              <button onClick={() => setCols(Math.max(1, cols - 1))} className="p-0.5 rounded hover:bg-muted">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </button>
              <span className="text-xs font-medium w-4 text-center text-foreground">{cols}</span>
              <button onClick={() => setCols(Math.min(10, cols + 1))} className="p-0.5 rounded hover:bg-muted">
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          </div>
          <button
            onClick={insertTable}
            className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Insert {rows} × {cols} Table
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
