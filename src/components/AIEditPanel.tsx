import { Wand2 } from "lucide-react";
import { useNotebooks } from "@/context/NotebookContext";
import { toolPill } from "@/lib/tool-colors";

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
      className={toolPill("aiEdit")}
      title="AI Edit Document"
    >
      <Wand2 className="h-3.5 w-3.5" />
      AI Edit
    </button>
  );
}
