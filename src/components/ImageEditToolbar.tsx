import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export type ImageAlign = "left" | "center" | "right";

interface ImageEditToolbarProps {
  /** Position (relative to the editor wrapper) of the selected image. */
  top: number;
  left: number;
  align: ImageAlign;
  widthPct: number;
  onAlign: (align: ImageAlign) => void;
  onWidth: (pct: number) => void;
  onRemove: () => void;
}

const SIZES = [33, 50, 75, 100];

export function ImageEditToolbar({
  top, left, align, widthPct, onAlign, onWidth, onRemove,
}: ImageEditToolbarProps) {
  const Btn = ({
    label, active, onClick, children,
  }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-1.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      data-testid="image-edit-toolbar"
      className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-xl border border-border bg-popover shadow-lg"
      style={{ top, left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Btn label="Align left (text wraps right)" active={align === "left"} onClick={() => onAlign("left")}>
        <AlignLeft className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Center" active={align === "center"} onClick={() => onAlign("center")}>
        <AlignCenter className="h-3.5 w-3.5" />
      </Btn>
      <Btn label="Align right (text wraps left)" active={align === "right"} onClick={() => onAlign("right")}>
        <AlignRight className="h-3.5 w-3.5" />
      </Btn>
      <div className="w-px h-4 bg-border mx-0.5" />
      {SIZES.map((s) => (
        <Btn key={s} label={`${s}% width`} active={Math.abs(widthPct - s) < 3} onClick={() => onWidth(s)}>
          {s}%
        </Btn>
      ))}
      <div className="w-px h-4 bg-border mx-0.5" />
      <Btn label="Remove image" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
      </Btn>
    </motion.div>
  );
}
