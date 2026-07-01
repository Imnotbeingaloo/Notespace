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
      className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[hsl(320_65%_55%/0.35)] bg-[hsl(320_65%_55%/0.08)] text-[hsl(320_70%_48%)] hover:bg-[hsl(320_65%_55%/0.15)] hover:text-[hsl(320_75%_42%)] transition-all duration-200 dark:text-[hsl(320_80%_72%)] dark:hover:text-[hsl(320_85%_78%)]"
      title="AI Edit Document"
    >
      <Wand2 className="h-3.5 w-3.5" />
      AI Edit
    </button>
  );
}
