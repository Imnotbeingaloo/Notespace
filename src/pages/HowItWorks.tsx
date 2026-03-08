import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { BookOpen, ArrowRight, PenLine, FolderOpen, Sparkles, Search, Brain, FileOutput, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedDivider from "@/components/AnimatedDivider";
import { useAuth } from "@/context/AuthContext";

const steps = [
  { icon: FolderOpen, title: "Create a Notebook", description: "Organize your notes by topic, class, or project. Each notebook is a dedicated space for related ideas. Pick an emoji, give it a name, and start building your knowledge base." },
  { icon: PenLine, title: "Write in Markdown", description: "Use the clean, distraction-free editor with full markdown support. Bold, headings, checklists, code blocks, tables — all built in. No formatting toolbar clutter, just pure writing." },
  { icon: Sparkles, title: "Get AI Insights", description: "Highlight any topic and get AI-powered explanations, summaries, and flashcards to deepen your understanding. It's like having a tutor who's read every textbook." },
  { icon: Brain, title: "Auto-Tag & Link", description: "Our AI automatically tags concepts and links related notes across notebooks. Your knowledge graph builds itself — connections you'd never find manually surface automatically." },
  { icon: Search, title: "Find Anything Instantly", description: "Use ⌘K search to find any note across all notebooks in milliseconds. Search by content, tags, or date. Never lose a thought again." },
  { icon: FileOutput, title: "Export & Share", description: "Export your notes to PDF, Markdown, or sync with Notion. Share notebooks with teammates or study groups with granular permission controls." },
];

const useCases = [
  { emoji: "🎓", title: "Students", description: "Capture lectures, generate study materials, and ace your exams with AI-powered review. Smart flashcards turn your notes into active recall exercises automatically.", extra: "Used by students at 50+ universities worldwide" },
  { emoji: "🔬", title: "Researchers", description: "Organize papers, extract key findings, and build a connected knowledge base that grows with your research. Auto-linking surfaces connections across hundreds of notes.", extra: "Supports LaTeX, code blocks, and citation formats" },
  { emoji: "✍️", title: "Writers", description: "Draft, outline, and refine your writing in a beautiful distraction-free editor. Use AI to brainstorm, restructure, and polish your prose without leaving the app.", extra: "Export to PDF, Markdown, or publish directly" },
  { emoji: "💼", title: "Professionals", description: "Meeting notes, project briefs, and team knowledge — all searchable and AI-enhanced. Shared notebooks keep everyone on the same page, literally.", extra: "Integrates with your existing workflow tools" },
];

function HorizontalSteps() {
  const [activeGroup, setActiveGroup] = useState(0);
  const progressWidth = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 3 groups: [0,1,2], [1,2,3], [3,4,5] -> simplify to 2 groups of 3
  const groups = [
    [0, 1, 2],
    [3, 4, 5],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGroup((prev) => (prev + 1) % groups.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    animate(progressWidth, ((activeGroup + 1) / groups.length) * 100, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    });
  }, [activeGroup]);

  const progressWidthPercent = useTransform(progressWidth, (v) => `${v}%`);
  const visibleSteps = groups[activeGroup];

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="relative h-1 bg-border rounded-full mb-10 max-w-md mx-auto overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: progressWidthPercent }}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {groups.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveGroup(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeGroup === i ? "bg-primary scale-125" : "bg-border hover:bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Steps carousel */}
      <div ref={scrollRef} className="overflow-hidden">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-3 gap-8"
        >
          {visibleSteps.map((stepIdx, i) => {
            const step = steps[stepIdx];
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative"
              >
                {/* Step number + dot */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {stepIdx + 1}
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={() => setActiveGroup((prev) => Math.max(0, prev - 1))}
          disabled={activeGroup === 0}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <span className="text-xs text-muted-foreground font-mono">
          {activeGroup + 1} / {groups.length}
        </span>
        <button
          onClick={() => setActiveGroup((prev) => Math.min(groups.length - 1, prev + 1))}
          disabled={activeGroup === groups.length - 1}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">Notebook Archive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-foreground transition-colors">How It Works</Link>
          </nav>
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20">
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-20 max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Get Started in Minutes
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
            How Notebook Archive <span className="text-primary">works</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From first note to full knowledge base — here's how you go from scattered thoughts to organized understanding. No complex setup, no learning curve.
          </p>
        </motion.div>
      </section>

      <AnimatedDivider />

      {/* Steps - Horizontal Sliding */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Six steps to smarter notes</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Each step builds on the last. Navigate through them to see the full workflow.</p>
          </motion.div>
          <HorizontalSteps />
        </div>
      </section>

      <AnimatedDivider />

      {/* Why It Matters */}
      <section className="bg-foreground/[0.03] py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Why it matters</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Traditional note-taking is broken. You write things down, file them away, and never look at them again. Notebook Archive changes that.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Active Recall, Not Passive Storage", desc: "AI-generated flashcards and summaries turn passive notes into active study materials. Research shows active recall improves retention by 50% compared to re-reading." },
              { title: "Connected Knowledge", desc: "Auto-linking creates a web of related concepts across your notebooks. When you write about quantum physics, it automatically connects to your math notes about wave equations." },
              { title: "Zero Friction", desc: "No complex folder structures. No tagging taxonomies to maintain. Just write, and the AI handles organization. Your knowledge graph builds itself as you take notes." },
              { title: "Always Accessible", desc: "Instant search means you can find any idea in milliseconds. Whether it's a lecture from last semester or a meeting note from yesterday, ⌘K gets you there instantly." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4"
              >
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-serif text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Use Cases */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Built for every kind of thinker</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">No matter how you work, Notebook Archive adapts to you.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4"
              >
                <span className="text-2xl flex-shrink-0">{uc.emoji}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-1">{uc.description}</p>
                  <p className="text-xs text-primary/70 font-medium">{uc.extra}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* CTA */}
      <section className="bg-foreground/[0.04] py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Ready to think better?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">Start capturing, organizing, and understanding your knowledge today. Free to start, no credit card required.</p>
            <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-bold text-foreground">Notebook Archive</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Notebook Archive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
