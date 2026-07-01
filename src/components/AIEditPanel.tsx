import { Wand2 } from "lucide-react";
import { useNotebooks } from "@/context/NotebookContext";

interface AIEditPanelProps {
  onApplyEdit?: (newContent: string) => void;
  onOpen?: () => void;
}

/**
 * AI Edit is now a trigger button that opens the shared Ask-AI panel in "edit" mode.
 * The previous standalone side drawer has been retired in favor of the unified Ask AI UX.
 */
export function AIEditPanel({ onOpen }: AIEditPanelProps) {
  const { activeNote } = useNotebooks();
  if (!activeNote) return null;
  return (
    <button
      onClick={() => onOpen?.()}
      className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all duration-200"
      title="AI Edit Document"
    >
      <Wand2 className="h-3.5 w-3.5" />
      AI Edit
    </button>
  );
}
