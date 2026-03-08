import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mic, ScanText } from "lucide-react";

const shufflerItems = [
  { label: "Summarize lecture notes", color: "hsl(var(--primary))" },
  { label: "Generate flashcards", color: "hsl(var(--accent))" },
  { label: "Extract key concepts", color: "hsl(var(--primary))" },
];

const typewriterMessages = [
  "✓ Auto-tagged: Quantum Physics → Wave Theory",
  "✓ Summary generated: 3 key takeaways",
  "✓ Flashcard created: Mitochondria → Powerhouse",
  "✓ Citation found: Einstein, 1905",
  "✓ Knowledge graph updated: 12 connections",
];

const days = ["S", "M", "T", "W", "T", "F", "S"];
const activeDays = [1, 3, 4]; // M, W, T

export function ShufflerCard() {
  const [cards, setCards] = useState(shufflerItems);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        next.unshift(next.pop()!);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[2rem] border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Brain className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">AI-Powered Analysis</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Automatically analyze, summarize, and extract insights from your notes.
      </p>
      <div className="relative h-[5.5rem] overflow-hidden mt-auto">
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{
                opacity: i === 0 ? 1 : i === 1 ? 0.6 : 0.3,
                y: i * 12,
                scale: 1 - i * 0.04,
                zIndex: cards.length - i,
              }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute inset-x-0 rounded-xl border border-border bg-background p-3 shadow-sm"
              style={{ transformOrigin: "center top" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                <span className="text-sm font-medium text-foreground">{card.label}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function TypewriterCard() {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const msg = typewriterMessages[currentMsg];
    if (charIndex < msg.length) {
      const timeout = setTimeout(() => {
        setDisplayText(msg.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentMsg((prev) => (prev + 1) % typewriterMessages.length);
        setCharIndex(0);
        setDisplayText("");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentMsg]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[2rem] border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <ScanText className="h-5 w-5 text-accent" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Smart Tagging & Linking</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Real-time intelligence that tags, links, and organizes as you write.
      </p>
      <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Live Feed</span>
        </div>
        <div className="min-h-[3rem]">
          <span className="text-foreground">{displayText}</span>
          <span className="inline-block w-[2px] h-3.5 bg-accent animate-pulse ml-0.5 align-middle" />
        </div>
      </div>
    </motion.div>
  );
}

export function SchedulerCard() {
  const [activeDay, setActiveDay] = useState(-1);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);
  const [step, setStep] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = async () => {
      setShowCursor(true);
      for (let i = 0; i < activeDays.length; i++) {
        const dayIdx = activeDays[i];
        const col = dayIdx % 7;
        const targetX = col * 38 + 16;
        const targetY = 16;

        setCursorPos({ x: targetX, y: targetY });
        await new Promise((r) => setTimeout(r, 600));
        setActiveDay(dayIdx);
        await new Promise((r) => setTimeout(r, 400));
      }
      setCursorPos({ x: 140, y: 60 });
      await new Promise((r) => setTimeout(r, 800));
      setShowCursor(false);
      await new Promise((r) => setTimeout(r, 2000));
      setActiveDay(-1);
      setStep((s) => s + 1);
    };
    sequence();
    const interval = setInterval(sequence, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-[2rem] border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Mic className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Study Planner</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Plan your study sessions and track progress with smart scheduling.
      </p>
      <div className="relative rounded-xl border border-border bg-background p-4 mt-auto" ref={gridRef}>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {days.map((day, i) => (
            <motion.div
              key={`${day}-${i}`}
              animate={
                activeDay === i
                  ? { scale: [1, 0.92, 1], backgroundColor: "hsl(var(--primary))" }
                  : {}
              }
              transition={{ duration: 0.3 }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium transition-colors ${
                activeDay === i
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </motion.div>
          ))}
        </div>
        <motion.div
          animate={{ scale: [1, 0.97, 1] }}
          transition={{ duration: 0.2, delay: 0.5 }}
          className="text-center text-[11px] font-medium text-primary bg-primary/10 rounded-lg py-1.5"
        >
          Save Schedule
        </motion.div>
        {showCursor && (
          <motion.div
            animate={{ x: cursorPos.x, y: cursorPos.y }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute w-4 h-4 pointer-events-none"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 drop-shadow-md">
              <path d="M1 1L6 14L8 8L14 6L1 1Z" fill="hsl(var(--foreground))" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
