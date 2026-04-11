import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BookOpen, FlaskConical, Users, LayoutList, ArrowLeft } from "lucide-react";

export interface NoteTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  title: string;
  content: string;
}

const templates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    icon: <FileText className="h-5 w-5" />,
    description: "Start from scratch",
    title: "Untitled Note",
    content: "",
  },
  {
    id: "lecture",
    name: "Lecture Notes",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Structured lecture format",
    title: "Lecture Notes",
    content: `## Lecture: [Topic]
**Date:** ${new Date().toLocaleDateString()}
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
    id: "meeting",
    name: "Meeting Notes",
    icon: <Users className="h-5 w-5" />,
    description: "Agenda, attendees & action items",
    title: "Meeting Notes",
    content: `## Meeting: [Title]
**Date:** ${new Date().toLocaleDateString()}
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
  {
    id: "cornell",
    name: "Cornell Method",
    icon: <LayoutList className="h-5 w-5" />,
    description: "Cue-note-summary format",
    title: "Cornell Notes",
    content: `## Topic: [Subject]
**Date:** ${new Date().toLocaleDateString()}

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
    content: `## Research: [Topic]
**Date:** ${new Date().toLocaleDateString()}
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
];

interface NoteTemplatePickerProps {
  onSelect: (template: NoteTemplate) => void;
  onBack: () => void;
}

export function NoteTemplatePicker({ onSelect, onBack }: NoteTemplatePickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-4 w-full max-w-sm px-4"
    >
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>
      <h3 className="font-serif text-lg font-bold text-foreground">Choose a Template</h3>
      <p className="text-sm text-muted-foreground text-center">
        Pick a structure to get started quickly
      </p>
      <div className="grid grid-cols-1 gap-2 w-full">
        {templates.map((tmpl) => (
          <motion.button
            key={tmpl.id}
            onClick={() => onSelect(tmpl)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/20 transition-all text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {tmpl.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{tmpl.name}</p>
              <p className="text-xs text-muted-foreground">{tmpl.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export { templates };
