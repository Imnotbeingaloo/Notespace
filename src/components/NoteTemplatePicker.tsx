import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Check,
  X,
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
  /** Tailwind gradient classes used in the mini-preview header strip. */
  swatch?: string;
}

const today = () => new Date().toLocaleDateString();

export const templates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    icon: <FileText className="h-5 w-5" />,
    description: "Start from scratch",
    title: "Untitled Note",
    content: "",
    category: "Blank",
    accent: "bg-muted text-foreground",
    swatch: "from-slate-200 to-slate-50 dark:from-slate-700 dark:to-slate-800",
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
    swatch: "from-amber-200 to-amber-50 dark:from-amber-500/30 dark:to-amber-900/30",
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
    swatch: "from-sky-200 to-sky-50 dark:from-sky-500/30 dark:to-sky-900/30",
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
    swatch: "from-violet-200 to-violet-50 dark:from-violet-500/30 dark:to-violet-900/30",
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
    swatch: "from-emerald-200 to-emerald-50 dark:from-emerald-500/30 dark:to-emerald-900/30",
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
    swatch: "from-rose-200 to-rose-50 dark:from-rose-500/30 dark:to-rose-900/30",
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
    swatch: "from-indigo-200 to-indigo-50 dark:from-indigo-500/30 dark:to-indigo-900/30",
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
**Argument 1 -**
- Evidence:
- Analysis:

**Argument 2 -**
- Evidence:
- Analysis:

**Argument 3 -**
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
    swatch: "from-teal-200 to-teal-50 dark:from-teal-500/30 dark:to-teal-900/30",
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
> "" - p.

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
    swatch: "from-orange-200 to-orange-50 dark:from-orange-500/30 dark:to-orange-900/30",
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
    swatch: "from-lime-200 to-lime-50 dark:from-lime-500/30 dark:to-lime-900/30",
    content: `## Weekly Review - Week of ${today()}

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
    swatch: "from-cyan-200 to-cyan-50 dark:from-cyan-500/30 dark:to-cyan-900/30",
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
- [ ] [Task] - Owner: [Name] - Due: [Date]

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
    swatch: "from-fuchsia-200 to-fuchsia-50 dark:from-fuchsia-500/30 dark:to-fuchsia-900/30",
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
> "" - p.

### How I'll Apply This
- 

### People to Recommend This To
- 
`,
  },
];

/** IDs of templates surfaced as the quick "featured" set inside NewNotePrompt. */
export const FEATURED_TEMPLATE_IDS = ["lecture", "cornell", "research", "meeting", "study-guide"];

export function getTemplateById(id: string) {
  return templates.find((t) => t.id === id);
}

const CATEGORIES = ["All", "Academic", "Productivity", "Personal", "Work"] as const;
type Category = (typeof CATEGORIES)[number];

interface NoteTemplatePickerProps {
  onSelect: (template: NoteTemplate) => void;
  onBack: () => void;
}

/** Tiny stylised paper-like preview built from the template's own markdown. */
function TemplatePaper({ template, compact = false }: { template: NoteTemplate; compact?: boolean }) {
  const lines = template.content
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .slice(0, compact ? 10 : 18);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg bg-white dark:bg-zinc-900 border border-border/60">
      {/* Header strip uses the template's accent gradient */}
      <div className={`h-3 w-full bg-gradient-to-r ${template.swatch ?? "from-primary/30 to-primary/10"}`} />
      <div className={`p-2 space-y-1 ${compact ? "" : "p-3 space-y-1.5"}`}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          const isHeading = trimmed.startsWith("##");
          const isSub = trimmed.startsWith("###");
          const isBullet = /^[-*]/.test(trimmed);
          const isQuote = trimmed.startsWith(">");
          const isTable = trimmed.startsWith("|");
          const isHr = /^-{3,}$/.test(trimmed);

          if (isHr) return <div key={i} className="h-px bg-foreground/10 my-1" />;
          if (isHeading)
            return <div key={i} className={`h-1.5 rounded ${compact ? "w-1/2" : "w-2/3"} bg-foreground/55`} />;
          if (isSub)
            return <div key={i} className={`h-1 rounded ${compact ? "w-2/5" : "w-1/2"} bg-foreground/35 mt-1`} />;
          if (isQuote)
            return (
              <div key={i} className="flex gap-1 items-center">
                <div className="w-0.5 h-2 bg-primary/60" />
                <div className="h-1 rounded w-3/4 bg-foreground/20" />
              </div>
            );
          if (isTable)
            return (
              <div key={i} className="grid grid-cols-3 gap-0.5">
                <div className="h-1 bg-foreground/20 rounded" />
                <div className="h-1 bg-foreground/15 rounded" />
                <div className="h-1 bg-foreground/15 rounded" />
              </div>
            );
          if (isBullet)
            return (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-foreground/45" />
                <div className="h-1 rounded w-2/3 bg-foreground/20" />
              </div>
            );
          return <div key={i} className="h-1 rounded w-4/5 bg-foreground/15" />;
        })}
      </div>
    </div>
  );
}

export function NoteTemplatePicker({ onSelect, onBack }: NoteTemplatePickerProps) {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<NoteTemplate | null>(null);

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
      {/* Compact header - no oversized hero copy */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">Template Gallery</h2>
        <div className="w-10" />
      </div>

      {/* Search + categories */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                category === c
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid - same generous card size as the featured chooser, page scrolls naturally */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
        {filtered.map((tmpl) => (
          <motion.button
            key={tmpl.id}
            onClick={() => setPreview(tmpl)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col gap-3 p-3 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-left overflow-hidden"
          >
            <div className="relative h-44 w-full">
              <TemplatePaper template={tmpl} compact />
              <div className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${tmpl.accent ?? "bg-primary/10 text-primary"}`}>
                {tmpl.icon}
              </div>
            </div>

            <div className="min-w-0 px-1 pb-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{tmpl.name}</p>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{tmpl.category}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tmpl.description}</p>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
            No templates match "{query}".
          </div>
        )}
      </div>


      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${preview.accent ?? "bg-primary/10 text-primary"}`}>
                    {preview.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{preview.name}</p>
                    <p className="text-[11px] text-muted-foreground">{preview.description}</p>
                  </div>
                </div>
                <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-[640px] rounded-lg bg-white dark:bg-zinc-900 border border-border/60 shadow-sm p-8"
                >
                  {preview.content.trim() ? (
                    <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-h2:mt-0 prose-h2:text-xl prose-h3:text-base prose-table:text-xs prose-th:bg-muted/40">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{preview.content}</ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      A clean, empty page - yours to fill.
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 bg-card">
                <button
                  onClick={() => setPreview(null)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { const t = preview; setPreview(null); onSelect(t); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Use this template
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { TemplatePaper };
