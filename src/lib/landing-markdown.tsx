import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useReduceMotionPref } from "@/hooks/use-reduce-motion-pref";

/**
 * Inline markdown renderer for the Landing typing preview.
 * Supports **bold**, *italic*, and `inline code`.
 */
export function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined) {
      tokens.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[2]}
        </strong>,
      );
    } else if (match[3] !== undefined) {
      tokens.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      tokens.push(
        <code key={key++} className="font-mono text-[0.95em]">
          {match[4]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

interface RenderMarkdownLineProps {
  text: string;
  /** Force disable the lock-in animation regardless of user preference. */
  forceReduceMotion?: boolean;
}

/**
 * Renders one finalized line of the typing preview.
 *
 * Animation rule: only fires when markdown formatting actually resolves
 * (headings or **bold**). Plain text renders instantly with no transition.
 */
export function RenderMarkdownLine({ text, forceReduceMotion }: RenderMarkdownLineProps) {
  const userPref = useReduceMotionPref();
  const systemPref = useReducedMotion();
  const reduceMotion = !!forceReduceMotion || userPref || !!systemPref;

  const isHeading =
    text.startsWith("# ") || text.startsWith("## ") || text.startsWith("### ");
  const hasBold = /\*\*[^*]+\*\*/.test(text);
  const shouldAnimate = isHeading || hasBold;

  const inner = (() => {
    if (text === "") return <p>{"\u00A0"}</p>;
    if (text.startsWith("### ")) {
      return (
        <h4 className="font-serif text-base font-bold text-foreground mt-2">
          {renderInline(text.slice(4))}
        </h4>
      );
    }
    if (text.startsWith("## ")) {
      return (
        <h3 className="font-serif text-lg font-bold text-foreground mt-2">
          {renderInline(text.slice(3))}
        </h3>
      );
    }
    if (text.startsWith("# ")) {
      return (
        <h2 className="font-serif text-xl font-bold text-foreground mt-2">
          {renderInline(text.slice(2))}
        </h2>
      );
    }
    return <p className="text-muted-foreground">{renderInline(text)}</p>;
  })();

  if (!shouldAnimate || reduceMotion) {
    return <div data-md-animate="false">{inner}</div>;
  }

  return (
    <motion.div
      data-md-animate="true"
      initial={{ opacity: 0, scale: 0.985, y: 2 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "left center", willChange: "transform, opacity" }}
    >
      {inner}
    </motion.div>
  );
}
