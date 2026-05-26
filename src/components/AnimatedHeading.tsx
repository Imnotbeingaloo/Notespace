import { motion, type Variants } from "framer-motion";
import { ElementType, useMemo } from "react";

interface AnimatedHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  /** Animate per-word (default) or per-character. */
  per?: "word" | "char";
  /** When true, uses whileInView. When false, uses animate on mount. */
  inView?: boolean;
}

/**
 * Cinematic heading reveal — fades each token up with a tiny stagger.
 */
export function AnimatedHeading({
  text,
  as = "h1",
  className = "",
  delay = 0,
  per = "word",
  inView = false,
}: AnimatedHeadingProps) {
  const tokens = useMemo(
    () => (per === "char" ? Array.from(text) : text.split(" ")),
    [text, per],
  );

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: per === "char" ? 0.018 : 0.06, delayChildren: delay },
    },
  };
  const child: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const motionProps = inView
    ? { initial: "hidden" as const, whileInView: "show" as const, viewport: { once: true, margin: "-60px" } }
    : { initial: "hidden" as const, animate: "show" as const };

  const MotionTag: any = (motion as any)[as];

  return (
    <MotionTag {...motionProps} variants={container} className={className} aria-label={text}>
      {tokens.map((tok, i) => (
        <motion.span
          key={`${tok}-${i}`}
          variants={child}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {tok}
          {per === "word" && i < tokens.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
