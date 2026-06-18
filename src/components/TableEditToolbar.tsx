import { useCallback, useState } from "react";
import { Plus, Minus, Trash2, TableProperties } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TableEditToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

function getActiveTable(editor: HTMLDivElement | null): HTMLTableElement | null {
  if (!editor) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  while (node && node !== editor) {
    if (node instanceof HTMLTableElement) return node;
    node = node.parentNode;
  }
  return null;
}

function getActiveCell(editor: HTMLDivElement | null): HTMLTableCellElement | null {
  if (!editor) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  while (node && node !== editor) {
    if (node instanceof HTMLTableCellElement) return node;
    node = node.parentNode;
  }
  return null;
}

function emitInput(editor: HTMLDivElement | null) {
  editor?.dispatchEvent(new Event("input", { bubbles: true }));
}

export function TableEditToolbar({ editorRef }: TableEditToolbarProps) {
  const [open, setOpen] = useState(false);

  const addRow = useCallback((position: "above" | "below") => {
    const table = getActiveTable(editorRef.current);
    const cell = getActiveCell(editorRef.current);
    if (!table || !cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    const cols = row.cells.length;
    const newRow = document.createElement("tr");
    for (let i = 0; i < cols; i++) {
      const td = document.createElement("td");
      td.style.cssText = "border:1px solid hsl(var(--border));padding:8px 12px";
      td.textContent = "Cell";
      newRow.appendChild(td);
    }
    if (position === "above") {
      row.parentNode?.insertBefore(newRow, row);
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    }
    emitInput(editorRef.current);
  }, [editorRef]);

  const addCol = useCallback((position: "left" | "right") => {
    const table = getActiveTable(editorRef.current);
    const cell = getActiveCell(editorRef.current);
    if (!table || !cell) return;
    const colIndex = cell.cellIndex;
    const insertIndex = position === "left" ? colIndex : colIndex + 1;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isHeader = i === 0 && row.closest("thead");
      const newCell = document.createElement(isHeader ? "th" : "td");
      newCell.style.cssText = isHeader
        ? "border:1px solid hsl(var(--border));padding:8px 12px;text-align:left"
        : "border:1px solid hsl(var(--border));padding:8px 12px";
      newCell.textContent = isHeader ? "Header" : "Cell";
      if (insertIndex >= row.cells.length) {
        row.appendChild(newCell);
      } else {
        row.insertBefore(newCell, row.cells[insertIndex]);
      }
    }
    emitInput(editorRef.current);
  }, [editorRef]);

  const deleteRow = useCallback(() => {
    const table = getActiveTable(editorRef.current);
    const cell = getActiveCell(editorRef.current);
    if (!table || !cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    // Don't delete the last row
    const tbody = row.closest("tbody") || row.closest("table");
    if (tbody && tbody.querySelectorAll("tr").length <= 1 && !row.closest("thead")) return;
    row.remove();
    // If table has no body rows left, remove the table
    const bodyRows = table.querySelectorAll("tbody tr");
    if (bodyRows.length === 0 && !table.querySelector("thead")) {
      table.remove();
    }
    emitInput(editorRef.current);
  }, [editorRef]);

  const deleteCol = useCallback(() => {
    const table = getActiveTable(editorRef.current);
    const cell = getActiveCell(editorRef.current);
    if (!table || !cell) return;
    const colIndex = cell.cellIndex;
    const rows = table.rows;
    // Don't delete if only 1 column
    if (rows[0] && rows[0].cells.length <= 1) return;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].cells[colIndex]) {
        rows[i].deleteCell(colIndex);
      }
    }
    emitInput(editorRef.current);
  }, [editorRef]);

  const deleteTable = useCallback(() => {
    const table = getActiveTable(editorRef.current);
    if (!table) return;
    table.remove();
    emitInput(editorRef.current);
    setOpen(false);
  }, [editorRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0"
              aria-label="Edit Table"
            >
              <TableProperties className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Edit Table</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-48 p-2" align="start" sideOffset={8}>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1.5">
          Rows
        </p>
        <button onClick={() => { addRow("above"); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Insert row above
        </button>
        <button onClick={() => { addRow("below"); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Insert row below
        </button>
        <button onClick={deleteRow} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
          <Minus className="h-3 w-3" /> Delete row
        </button>

        <div className="border-t border-border my-1.5" />

        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1.5">
          Columns
        </p>
        <button onClick={() => { addCol("left"); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Insert column left
        </button>
        <button onClick={() => { addCol("right"); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted transition-colors">
          <Plus className="h-3 w-3" /> Insert column right
        </button>
        <button onClick={deleteCol} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
          <Minus className="h-3 w-3" /> Delete column
        </button>

        <div className="border-t border-border my-1.5" />

        <button onClick={deleteTable} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 className="h-3 w-3" /> Delete table
        </button>
      </PopoverContent>
    </Popover>
  );
}
