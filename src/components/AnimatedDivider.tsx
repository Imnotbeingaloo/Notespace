import { motion } from "framer-motion";

export default function AnimatedDivider() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent origin-center"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
        />
      </div>
    </div>
  );
}
