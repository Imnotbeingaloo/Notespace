import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const WEEKLY_KEY = "weekly-word-counts";

export interface DailyCount {
  date: string; // YYYY-MM-DD
  words: number;
}

export function getWeeklyData(): DailyCount[] {
  try {
    const saved = localStorage.getItem(WEEKLY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    return [];
  }
  return [];
}

export function recordDailyWords(date: string, words: number) {
  const data = getWeeklyData();
  const idx = data.findIndex((d) => d.date === date);
  if (idx >= 0) {
    data[idx].words = words;
  } else {
    data.push({ date, words });
  }
  // Keep only last 30 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const filtered = data.filter((d) => new Date(d.date) >= cutoff);
  localStorage.setItem(WEEKLY_KEY, JSON.stringify(filtered));
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyWritingChart() {
  const chartData = useMemo(() => {
    const data = getWeeklyData();
    const today = new Date();
    const days: { name: string; words: number; isToday: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = data.find((x) => x.date === dateStr);
      days.push({
        name: DAY_LABELS[d.getDay()],
        words: entry?.words || 0,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const maxWords = Math.max(...chartData.map((d) => d.words), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-foreground">This Week</h4>
        <span className="text-[10px] text-muted-foreground">
          {chartData.reduce((s, d) => s + d.words, 0).toLocaleString()} words total
        </span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide domain={[0, maxWords * 1.2]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`${value.toLocaleString()} words`, ""]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="words" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isToday ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
