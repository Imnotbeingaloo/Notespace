import { motion } from "framer-motion";

/**
 * Lightweight loading animation for the Classic ↔ Modern paper-style transition.
 * No logo — just a tasteful animated bar + caption that fills 2–3s of work.
 */
export function PaperStyleSwitcher({ label = "Switching notebook style" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[40vh]">
      <div className="relative w-56 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground tracking-wide">{label}</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
