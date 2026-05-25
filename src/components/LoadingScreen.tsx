import { motion } from "framer-motion";

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background relative overflow-hidden min-h-[60vh]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.12 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute w-64 h-64 rounded-full bg-primary blur-3xl"
      />
      <motion.img
        src="/logo.png"
        alt=""
        className="h-14 w-14 object-contain relative z-10"
        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {label && (
        <motion.span
          className="text-sm text-muted-foreground mt-4 relative z-10 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.span>
      )}
      <div className="flex gap-1.5 mt-4 relative z-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
