import { motion } from "framer-motion";

export default function AnimatedDivider() {
  return (
    <div className="relative py-6 overflow-hidden">
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      
      {/* Center decorative line with glow */}
      <div className="container mx-auto max-w-5xl px-6">
        <div className="relative flex items-center justify-center gap-4">
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent origin-left"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
            className="relative flex items-center justify-center"
          >
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 border border-foreground/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/70" />
            </div>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent origin-right"
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
