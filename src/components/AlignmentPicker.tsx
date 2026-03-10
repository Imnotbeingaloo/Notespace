import { useCallback, useState } from "react";
import { AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AlignmentPickerProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

const alignOptions = [
  { icon: AlignLeft, label: "Align Left", command: "justifyLeft" },
  { icon: AlignCenter, label: "Align Center", command: "justifyCenter" },
  { icon: AlignRight, label: "Align Right", command: "justifyRight" },
];

export function AlignmentPicker({ editorRef }: AlignmentPickerProps) {
  const [open, setOpen] = useState(false);

  const handleAction = useCallback((command: string) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command);
    setOpen(false);
  }, [editorRef]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 flex-shrink-0 inline-flex items-center gap-0.5"
          title="Text Alignment"
        >
          <AlignLeft className="h-4 w-4" />
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1.5" align="start" sideOffset={8}>
        <div className="space-y-0.5">
          {alignOptions.map((opt) => (
            <button
              key={opt.command}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleAction(opt.command); }}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
            >
              <opt.icon className="h-4 w-4 text-muted-foreground" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
