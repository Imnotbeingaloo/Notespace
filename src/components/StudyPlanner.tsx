import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CalendarDays, Plus, Check, Flame, Trophy, X, Clock, BookOpen, Bell, BellOff, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNotebooks } from "@/context/NotebookContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, startOfWeek, addDays, isToday, isSameDay, subWeeks, addWeeks, differenceInCalendarDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string | null;
  completed: boolean;
  completed_at: string | null;
  notebook_id: string | null;
  remind_via_email: boolean;
  created_at: string;
}

export function StudyPlanner({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { notebooks } = useNotebooks();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAdd, setShowAdd] = useState(false);
  const [notebookPickerOpen, setNotebookPickerOpen] = useState(false);
  // New plan form
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newNotebook, setNewNotebook] = useState(notebooks.length > 0 ? notebooks[0].id : "");
  const [newRemind, setNewRemind] = useState(false);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("study_plans" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true });
    setPlans((data as any as StudyPlan[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // In-app reminder toast on mount
  useEffect(() => {
    if (!plans.length) return;
    const todayPlans = plans.filter(
      (p) => !p.completed && p.scheduled_date === format(new Date(), "yyyy-MM-dd")
    );
    if (todayPlans.length > 0) {
      toast.info(`📚 You have ${todayPlans.length} study session${todayPlans.length > 1 ? "s" : ""} planned for today!`, { duration: 6000 });
    }
  }, [plans]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayPlans = plans.filter((p) => p.scheduled_date === selectedDateStr);

  // Streak calculation
  const streak = useMemo(() => {
    const completedDates = new Set(
      plans.filter((p) => p.completed).map((p) => p.scheduled_date)
    );
    let count = 0;
    let day = new Date();
    // If today has no completed session, start from yesterday
    if (!completedDates.has(format(day, "yyyy-MM-dd"))) {
      day = addDays(day, -1);
    }
    while (completedDates.has(format(day, "yyyy-MM-dd"))) {
      count++;
      day = addDays(day, -1);
    }
    return count;
  }, [plans]);

  const totalCompleted = plans.filter((p) => p.completed).length;
  const thisWeekCompleted = plans.filter(
    (p) => p.completed && weekDays.some((d) => format(d, "yyyy-MM-dd") === p.scheduled_date)
  ).length;
  const thisWeekTotal = plans.filter(
    (p) => weekDays.some((d) => format(d, "yyyy-MM-dd") === p.scheduled_date)
  ).length;

  const addPlan = async () => {
    if (!user || !newTitle.trim() || !newNotebook) return;
    const { data } = await supabase
      .from("study_plans" as any)
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        scheduled_date: selectedDateStr,
        scheduled_time: newTime || null,
        notebook_id: newNotebook,
        remind_via_email: newRemind,
      } as any)
      .select()
      .single();
    if (data) {
      setPlans((prev) => [...prev, data as any as StudyPlan]);
      setNewTitle("");
      setNewTime("");
      setNewNotebook(notebooks.length > 0 ? notebooks[0].id : "");
      setNewRemind(false);
      setShowAdd(false);
      toast.success("Study session added!");
    }
  };

  const hasEverCompleted = useRef(false);

  // Track if user has already completed something before this session
  useEffect(() => {
    if (totalCompleted > 0) hasEverCompleted.current = true;
  }, []);

  const toggleComplete = async (plan: StudyPlan) => {
    const completed = !plan.completed;
    const wasFirstCompletion = completed && totalCompleted === 0 && !hasEverCompleted.current;
    await supabase
      .from("study_plans" as any)
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      } as any)
      .eq("id", plan.id);
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id ? { ...p, completed, completed_at: completed ? new Date().toISOString() : null } : p
      )
    );
    if (completed) {
      toast.success("🎉 Session completed!");
      if (wasFirstCompletion) {
        // Fire confetti!
        hasEverCompleted.current = true;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { x: 0.7, y: 0.4 },
          colors: ["hsl(142, 71%, 45%)", "hsl(48, 96%, 53%)", "hsl(262, 83%, 58%)", "hsl(0, 84%, 60%)"],
        });
      }
    }
  };

  const deletePlan = async (id: string) => {
    await supabase.from("study_plans" as any).delete().eq("id", id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Count sessions per day for the week dots
  const dayCounts = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    weekDays.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      const dayItems = plans.filter((p) => p.scheduled_date === key);
      map[key] = { total: dayItems.length, completed: dayItems.filter((p) => p.completed).length };
    });
    return map;
  }, [plans, weekDays]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full border-l border-border bg-card flex flex-col w-full lg:w-[360px] max-w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-sm font-bold text-foreground">Study Planner</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b border-border">
        <div className="flex flex-col items-center rounded-xl bg-primary/10 p-2">
          <Flame className="h-4 w-4 text-primary mb-1" />
          <span className="text-lg font-bold text-foreground">{streak}</span>
          <span className="text-[10px] text-muted-foreground">Day Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-accent/10 p-2">
          <Trophy className="h-4 w-4 text-accent mb-1" />
          <span className="text-lg font-bold text-foreground">{totalCompleted}</span>
          <span className="text-[10px] text-muted-foreground">Completed</span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-muted p-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-lg font-bold text-foreground">{thisWeekCompleted}/{thisWeekTotal}</span>
          <span className="text-[10px] text-muted-foreground">This Week</span>
        </div>
      </div>

      {/* Week navigator */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const isSelected = isSameDay(day, selectedDate);
            const counts = dayCounts[key] || { total: 0, completed: 0 };
            const allDone = counts.total > 0 && counts.completed === counts.total;
            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 transition-all text-[11px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday(day)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="font-medium">{format(day, "EEE").charAt(0)}</span>
                <span className="font-bold text-xs">{format(day, "d")}</span>
                {counts.total > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full ${allDone ? "bg-green-500" : isSelected ? "bg-primary-foreground/50" : "bg-primary/40"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day sessions */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">
            {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE, MMM d")}
          </p>
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowAdd(true)}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {/* Add form */}
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-border bg-background p-3 space-y-2 overflow-hidden"
            >
              <Input
                placeholder="What are you studying?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && addPlan()}
                autoFocus
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-8 text-xs flex-1"
                  placeholder="Time (optional)"
                />
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setNotebookPickerOpen((p) => !p)}
                    className="w-full h-8 text-xs rounded-xl border border-border bg-background px-3 text-left truncate flex items-center gap-2 hover:bg-muted/50 transition-colors"
                  >
                    {newNotebook ? (
                      <>
                        <span>{notebooks.find((nb) => nb.id === newNotebook)?.emoji}</span>
                        <span className="truncate text-foreground">{notebooks.find((nb) => nb.id === newNotebook)?.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Select notebook</span>
                    )}
                    <ChevronRight className={`h-3 w-3 ml-auto text-muted-foreground transition-transform duration-200 ${notebookPickerOpen ? "rotate-90" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {notebookPickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
                      >
                        <div className="max-h-36 overflow-y-auto scrollbar-thin p-1">
                          {notebooks.map((nb) => (
                            <button
                              key={nb.id}
                              type="button"
                              onClick={() => {
                                setNewNotebook(nb.id);
                                setNotebookPickerOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                                newNotebook === nb.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="text-base">{nb.emoji}</span>
                              <span className="truncate">{nb.name}</span>
                              {newNotebook === nb.id && <Check className="h-3 w-3 ml-auto text-primary" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setNewRemind(!newRemind)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${newRemind ? "text-primary" : "text-muted-foreground"}`}
                >
                  {newRemind ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                  Email reminder
                </button>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-6 text-xs" onClick={addPlan} disabled={!newTitle.trim() || !newNotebook}>
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Session list */}
          {dayPlans.length === 0 && !showAdd && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No sessions planned</p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs gap-1" onClick={() => setShowAdd(true)}>
                <Plus className="h-3 w-3" /> Plan a session
              </Button>
            </motion.div>
          )}

          {dayPlans.map((plan) => (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-start gap-3 rounded-xl border p-3 transition-all ${
                plan.completed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-border bg-background hover:border-primary/20"
              }`}
            >
              <button
                onClick={() => toggleComplete(plan)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  plan.completed
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-muted-foreground/30 hover:border-primary"
                }`}
              >
                {plan.completed && <Check className="h-3 w-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${plan.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {plan.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {plan.scheduled_time && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" /> {plan.scheduled_time.slice(0, 5)}
                    </span>
                  )}
                  {plan.notebook_id && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <BookOpen className="h-2.5 w-2.5" />
                      {notebooks.find((n) => n.id === plan.notebook_id)?.name ?? "Notebook"}
                    </span>
                  )}
                  {plan.remind_via_email && (
                    <Bell className="h-2.5 w-2.5 text-primary/50" />
                  )}
                </div>
              </div>
              <button
                onClick={() => deletePlan(plan.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Weekly progress bar */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-medium">Weekly Progress</span>
          <span className="text-[10px] text-muted-foreground">
            {thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: thisWeekTotal > 0 ? `${(thisWeekCompleted / thisWeekTotal) * 100}%` : "0%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>
    </motion.div>
  );
}
