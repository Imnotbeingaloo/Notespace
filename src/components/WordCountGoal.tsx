import { useState, useMemo, useEffect } from "react";
import { Target, Check, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface WordCountGoalProps {
  content: string;
}

const GOAL_KEY = "daily-word-goal";
const COUNT_KEY = "daily-word-count-date";

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

  // Track daily baseline
  const [baseline, setBaseline] = useState(() => {
    const saved = localStorage.getItem(COUNT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === getToday()) return parsed.baseline as number;
    }
    return 0;
  });

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
    // New day - set current word count as baseline
    const newBaseline = wordCount;
    setBaseline(newBaseline);
    localStorage.setItem(COUNT_KEY, JSON.stringify({ date: getToday(), baseline: newBaseline }));
  }, []);

  const wordsToday = Math.max(0, wordCount - baseline);
  const progress = goal > 0 ? Math.min(100, Math.round((wordsToday / goal) * 100)) : 0;
  const isComplete = goal > 0 && wordsToday >= goal;

  const saveGoal = () => {
    const val = parseInt(inputValue, 10);
    if (val > 0) {
      setGoal(val);
      localStorage.setItem(GOAL_KEY, String(val));
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
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              <Target className="h-3 w-3" />
              <span>Set goal</span>
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
        <Target className="h-3 w-3 text-muted-foreground shrink-0" />
        <Input
          autoFocus
          type="number"
          min={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") saveGoal(); if (e.key === "Escape") setEditing(false); }}
          className="h-6 w-20 text-[11px] px-2"
          placeholder="Words"
        />
        <span className="text-[10px] text-muted-foreground">words/day</span>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={saveGoal}>
          <Check className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-2 px-2 py-1">
        <div className="flex items-center gap-1.5">
          {isComplete ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Target className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={`text-[10px] sm:text-[11px] tabular-nums font-medium ${isComplete ? "text-green-500" : "text-muted-foreground"}`}>
            {wordsToday.toLocaleString()}/{goal.toLocaleString()}
          </span>
        </div>
        <Progress value={progress} className="h-1.5 w-16 sm:w-24" />
        <span className={`text-[10px] tabular-nums ${isComplete ? "text-green-500 font-medium" : "text-muted-foreground"}`}>
          {progress}%
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { setEditing(true); setInputValue(String(goal)); }}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-2.5 w-2.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top"><p>Edit daily goal</p></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
