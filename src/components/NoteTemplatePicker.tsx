import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  FlaskConical,
  Users,
  LayoutList,
  ArrowLeft,
  Search,
  GraduationCap,
  CalendarCheck,
  Library,
  Layers,
  PencilRuler,
  Sigma,
  NotebookPen,
} from "lucide-react";

export interface NoteTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  title: string;
  content: string;
  category: "Academic" | "Productivity" | "Personal" | "Work" | "Blank";
  accent?: string; // tailwind classes for the icon tile
}

const today = () => new Date().toLocaleDateString();

const templates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    icon: <FileText className="h-5 w-5" />,
    description: "Start from scratch",
    title: "Untitled Note",
    content: "",
    category: "Blank",
    accent: "bg-muted text-foreground",
  },
  // ---------- Academic ----------
  {
    id: "lecture",
    name: "Lecture Notes",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Structured lecture format",
    title: "Lecture Notes",
    category: "Academic",
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    content: `## Lecture: [Topic]
**Date:** ${today()}
**Instructor:** 

---

### Key Concepts
- 

### Definitions
| Term | Definition |
|------|-----------|
|  |  |

### Important Points
1. 

### Questions
- 

### Summary
> Write a brief summary of the lecture here.

---

### Action Items
- [ ] Review notes
- [ ] Complete assigned reading
`,
  },
  {
    id: "cornell",
    name: "Cornell Method",
    icon: <LayoutList className="h-5 w-5" />,
    description: "Cue • Note • Summary format",
    title: "Cornell Notes",
    category: "Academic",
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    content: `## Topic: [Subject]
**Date:** ${today()}

---

### Cues / Questions
> Write key questions or cue words here after the lecture.

- 

---

### Notes
> Main notes go here during the lecture.



---

### Summary
> Write a 2-3 sentence summary of the notes above.
`,
  },
  {
    id: "research",
    name: "Research Notes",
    icon: <FlaskConical className="h-5 w-5" />,
    description: "Hypothesis, methods & findings",
    title: "Research Notes",
    category: "Academic",
    accent: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    content: `## Research: [Topic]
**Date:** ${today()}
**Source:** 

---

### Research Question


### Hypothesis


### Methodology


### Key Findings
1. 

### Evidence & Data


### Analysis


### Conclusions


### References
1. 
`,
  },
  {
    id: "study-guide",
    name: "Study Guide",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Exam prep with topics & checks",
    title: "Study Guide",
    category: "Academic",
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    content: `## Study Guide: [Course / Exam]
**Exam date:** 
**Last reviewed:** ${today()}

---

### Topics to Master
- [ ] Topic 1
- [ ] Topic 2
- [ ] Topic 3

### Key Definitions
| Term | Meaning |
|------|---------|
|  |  |

### Practice Questions
1. 
2. 

### Common Mistakes to Avoid
- 

### Self-Check
> Can I explain each topic above in plain language without notes?
`,
  },
  {
    id: "flashcards",
    name: "Flashcards",
    icon: <Layers className="h-5 w-5" />,
    description: "Q&A pairs for active recall",
    title: "Flashcards",
    category: "Academic",
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    content: `## Flashcards: [Subject]
**Created:** ${today()}

---

**Q:** 
**A:** 

---

**Q:** 
**A:** 

---

**Q:** 
**A:** 

---

> Tip: cover the answer and try to recall before revealing.
`,
  },
  {
    id: "essay-outline",
    name: "Essay Outline",
    icon: <PencilRuler className="h-5 w-5" />,
    description: "Thesis, arguments & evidence",
    title: "Essay Outline",
    category: "Academic",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    content: `## Essay: [Working Title]
**Due:** 
**Word target:** 

---

### Thesis
> One-sentence argument the essay will defend.

### Introduction
- Hook:
- Context:
- Thesis statement:

### Body
**Argument 1 —**
- Evidence:
- Analysis:

**Argument 2 —**
- Evidence:
- Analysis:

**Argument 3 —**
- Evidence:
- Analysis:

### Counter-argument & Rebuttal


### Conclusion
- Restate thesis:
- Broader implication:

### Sources
1. 
`,
  },
  {
    id: "reading-notes",
    name: "Reading Notes",
    icon: <NotebookPen className="h-5 w-5" />,
    description: "Active reading for textbooks",
    title: "Reading Notes",
    category: "Academic",
    accent: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    content: `## Reading: [Chapter / Article]
**Author:** 
**Pages:** 
**Date:** ${today()}

---

### Before Reading
- What do I already know?
- What do I want to learn?

### Main Ideas
- 

### Important Quotes
> "" — p.

### Vocabulary
| Word | Definition |
|------|-----------|
|  |  |

### Questions Raised
- 

### Summary in My Own Words

`,
  },
  {
    id: "problem-set",
    name: "Problem Set",
    icon: <Sigma className="h-5 w-5" />,
    description: "Step-by-step worked solutions",
    title: "Problem Set",
    category: "Academic",
    accent: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    content: `## Problem Set: [Course / Unit]
**Due:** 
**Date:** ${today()}

---

### Problem 1
**Given:**
**Find:**
**Approach:**
**Work:**

**Answer:**

---

### Problem 2
**Given:**
**Find:**
**Approach:**
**Work:**

**Answer:**

---

### Reflection
- What concepts did I use?
- Where did I get stuck?
`,
  },
  // ---------- Productivity ----------
  {
    id: "weekly-review",
    name: "Weekly Review",
    icon: <CalendarCheck className="h-5 w-5" />,
    description: "Reflect on the week, plan the next",
    title: "Weekly Review",
    category: "Productivity",
    accent: "bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300",
    content: `## Weekly Review — Week of ${today()}

---

### Wins 🏆
- 

### Challenges
- 

### Lessons Learned
- 

### Numbers / Metrics
| Metric | This week | Last week |
|--------|-----------|-----------|
|  |  |  |

### Next Week's Top 3 Priorities
1. 
2. 
3. 

### One Thing to Improve
> 
`,
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    icon: <Users className="h-5 w-5" />,
    description: "Agenda, attendees & action items",
    title: "Meeting Notes",
    category: "Work",
    accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    content: `## Meeting: [Title]
**Date:** ${today()}
**Attendees:** 

---

### Agenda
1. 

### Discussion Notes


### Decisions Made
- 

### Action Items
- [ ] [Task] — Owner: [Name] — Due: [Date]

### Next Meeting
**Date:** 
**Topics:** 
`,
  },
  // ---------- Personal ----------
  {
    id: "book-notes",
    name: "Book Notes",
    icon: <Library className="h-5 w-5" />,
    description: "Capture ideas while reading a book",
    title: "Book Notes",
    category: "Personal",
    accent: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    content: `## 📖 [Book Title]
**Author:** 
**Started:** ${today()}
**Finished:** 
**Rating:** ★★★★☆

---

### One-Sentence Summary
> 

### Why I Read It


### Key Ideas
1. 
2. 
3. 

### Favourite Quotes
> "" — p.

### How I'll Apply This
- 

### People to Recommend This To
- 
`,
  },
];

const CATEGORIES = ["All", "Academic", "Productivity", "Personal", "Work"] as const;
type Category = (typeof CATEGORIES)[number];

interface NoteTemplatePickerProps {
  onSelect: (template: NoteTemplate) => void;
  onBack: () => void;
}

export function NoteTemplatePicker({ onSelect, onBack }: NoteTemplatePickerProps) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "All" && t.category !== category && t.id !== "blank") return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col w-full max-w-5xl mx-auto px-4 sm:px-8 py-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Template Library</h2>
          <p className="text-xs text-muted-foreground mt-1">Pick a structure — you can edit anything after.</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates…"
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              category === c
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((tmpl) => {
          const isHover = hovered === tmpl.id;
          return (
            <motion.button
              key={tmpl.id}
              onClick={() => onSelect(tmpl)}
              onMouseEnter={() => setHovered(tmpl.id)}
              onMouseLeave={() => setHovered((h) => (h === tmpl.id ? null : h))}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all text-left overflow-hidden"
            >
              {/* Mini preview */}
              <div className="relative h-28 rounded-lg bg-gradient-to-br from-muted/40 to-muted/10 border border-border/60 overflow-hidden">
                <div className="absolute inset-0 p-2.5 space-y-1.5">
                  <div className="h-1.5 w-1/2 rounded bg-foreground/30" />
                  <div className="h-1 w-3/4 rounded bg-foreground/15" />
                  <div className="h-1 w-2/3 rounded bg-foreground/15" />
                  <div className="h-1 w-4/5 rounded bg-foreground/10" />
                  <div className="h-1 w-1/2 rounded bg-foreground/10" />
                  <div className="h-1 w-3/5 rounded bg-foreground/10" />
                </div>
                <div className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center ${tmpl.accent ?? "bg-primary/10 text-primary"}`}>
                  {tmpl.icon}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{tmpl.name}</p>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{tmpl.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description}</p>
              </div>

              <span
                className={`absolute bottom-3 right-3 text-[11px] font-medium text-primary transition-opacity ${
                  isHover ? "opacity-100" : "opacity-0"
                }`}
              >
                Use template →
              </span>
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
            No templates match "{query}".
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { templates };
