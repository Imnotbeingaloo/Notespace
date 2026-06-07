import { motion } from "framer-motion";

/**
 * Minimalist circular spinner for the Classic ↔ Modern paper-style transition.
 */
export function PaperStyleSwitcher({ label = "Switching notebook style" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 min-h-[40vh]">
      <motion.span
        aria-label={label}
        role="status"
        className="block h-10 w-10 rounded-full border-2 border-muted border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
      <span className="text-sm font-medium text-muted-foreground tracking-wide">{label}</span>
    </div>
  );
}
