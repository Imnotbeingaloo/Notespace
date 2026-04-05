import { useState, useMemo, useEffect, useRef } from "react";
import { Target, Check, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import confetti from "canvas-confetti";

interface WordCountGoalProps {
  content: string;
}

const GOAL_KEY = "daily-word-goal";
const COUNT_KEY = "daily-word-count-date";
const CELEBRATED_KEY = "daily-goal-celebrated";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function WordCountGoal({ content }: WordCountGoalProps) {
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const hasCelebrated = useRef(false);

  // Track daily baseline
  const [baseline, setBaseline] = useState(() => {
    const saved = localStorage.getItem(COUNT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === getToday()) return parsed.baseline as number;
    }
    return 0;
  });

  // Check if already celebrated today
  useEffect(() => {
    const celebrated = localStorage.getItem(CELEBRATED_KEY);
    if (celebrated === getToday()) hasCelebrated.current = true;
  }, []);

  const wordCount = useMemo(() => {
    const text = content.replace(/[#*_~`>\-\[\]()!|]/g, "").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [content]);

  // Set baseline on first load of the day
  useEffect(() => {
    const saved = localStorage.getItem(COUNT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === getToday()) return;
    }
    const newBaseline = wordCount;
    setBaseline(newBaseline);
    localStorage.setItem(COUNT_KEY, JSON.stringify({ date: getToday(), baseline: newBaseline }));
  }, []);

  const wordsToday = Math.max(0, wordCount - baseline);
  const progress = goal > 0 ? Math.min(100, Math.round((wordsToday / goal) * 100)) : 0;
  const isComplete = goal > 0 && wordsToday >= goal;

  // Fire confetti when goal is completed
  useEffect(() => {
    if (isComplete && !hasCelebrated.current) {
      hasCelebrated.current = true;
      localStorage.setItem(CELEBRATED_KEY, getToday());
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#2dd4bf", "#14b8a6", "#0d9488", "#fbbf24", "#f59e0b"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#2dd4bf", "#14b8a6", "#0d9488", "#fbbf24", "#f59e0b"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isComplete]);

  const saveGoal = () => {
    const val = parseInt(inputValue, 10);
    if (val > 0) {
      setGoal(val);
      localStorage.setItem(GOAL_KEY, String(val));
      hasCelebrated.current = false;
      localStorage.removeItem(CELEBRATED_KEY);
    }
    setEditing(false);
  };

  if (goal === 0 && !editing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { setEditing(true); setInputValue("500"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/10 border border-primary/20"
            >
              <Target className="h-3.5 w-3.5" />
              <span>Set Daily Goal</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top"><p>Set a daily writing goal</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1">
        <Target className="h-3.5 w-3.5 text-primary shrink-0" />
        <Input
          autoFocus
          type="number"
          min={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveGoal(); if (e.key === "Escape") setEditing(false); }}
          className="h-7 w-20 text-xs px-2"
          placeholder="Words"
        />
        <span className="text-[11px] text-muted-foreground">words/day</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveGoal}>
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-2 px-2 py-1">
        <div className="flex items-center gap-1.5">
          {isComplete ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Target className="h-3.5 w-3.5 text-primary" />
          )}
          <span className={`text-[11px] sm:text-xs tabular-nums font-semibold ${isComplete ? "text-green-500" : "text-foreground"}`}>
            {wordsToday.toLocaleString()}/{goal.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-2 w-20 sm:w-28" />
        <span className={`text-[11px] tabular-nums font-medium ${isComplete ? "text-green-500" : "text-muted-foreground"}`}>
          {progress}%
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { setEditing(true); setInputValue(String(goal)); }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top"><p>Edit daily goal</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
