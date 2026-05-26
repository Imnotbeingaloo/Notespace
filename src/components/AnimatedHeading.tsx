import { motion } from "framer-motion";
import { ElementType, useMemo } from "react";

interface AnimatedHeadingProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Animate per-word (default) or per-character. */
  per?: "word" | "char";
  /** When true, uses whileInView. When false, uses animate on mount. */
  inView?: boolean;
}

/**
 * Cinematic heading reveal — fades each token up with a tiny stagger.
 * Respects prefers-reduced-motion by virtue of framer-motion's defaults.
 */
export function AnimatedHeading({
  text,
  as: Tag = "h1",
  className = "",
  delay = 0,
  per = "word",
  inView = false,
}: AnimatedHeadingProps) {
  const tokens = useMemo(() => (per === "char" ? Array.from(text) : text.split(" ")), [text, per]);

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: per === "char" ? 0.018 : 0.06, delayChildren: delay },
    },
  };
  const child = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  const motionProps = inView
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, margin: "-60px" } }
    : { initial: "hidden" as const, animate: "show" as const };

  return (
    <motion.create-element style={{ display: "block" }} />
  ) as any;
}
