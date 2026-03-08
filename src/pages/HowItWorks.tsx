import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, PenLine, FolderOpen, Sparkles, Search, Brain, FileOutput } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const steps = [
  { icon: FolderOpen, title: "Create a Notebook", description: "Organize your notes by topic, class, or project. Each notebook is a dedicated space for related ideas." },
  { icon: PenLine, title: "Write in Markdown", description: "Distraction-free editor with full markdown. Bold, headings, checklists, code blocks — all built in." },
  { icon: Sparkles, title: "Get AI Insights", description: "Highlight any topic and get AI-powered explanations, summaries, and flashcards instantly." },
  { icon: Brain, title: "Auto-Tag & Link", description: "AI tags concepts and links related notes across notebooks. Your knowledge graph builds itself." },
  { icon: Search, title: "Find Anything", description: "⌘K search finds any note across all notebooks in milliseconds. Search by content, tags, or date." },
  { icon: FileOutput, title: "Export & Share", description: "Export to PDF, Markdown, or Notion. Share notebooks with granular permission controls." },
];

const useCases = [
  { emoji: "🎓", title: "Students", description: "Capture lectures, generate study materials, and ace your exams with AI-powered review.", extra: "Used by students at 50+ universities worldwide" },
  { emoji: "🔬", title: "Researchers", description: "Organize papers, extract key findings, and build a connected knowledge base that grows with your research.", extra: "Supports LaTeX, code blocks, and citation formats" },
  { emoji: "✍️", title: "Writers", description: "Draft, outline, and refine your writing in a beautiful distraction-free editor with AI brainstorming.", extra: "Export to PDF, Markdown, or publish directly" },
  { emoji: "💼", title: "Professionals", description: "Meeting notes, project briefs, and team knowledge — all searchable and AI-enhanced.", extra: "Integrates with your existing workflow tools" },
];

/* ─── Cinematic Step Reel ─── */
function StepReel() {
  const progress = useMotionValue(0); // 0 to 5 (step index)
  const [activeStep, setActiveStep] = useState(0);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    const runSequence = async () => {
      while (!cancelled.current) {
        for (let i = 0; i < steps.length; i++) {
          if (cancelled.current) return;
          // Animate wheel to this step
          await animate(progress, i, {
            duration: i === 0 ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (v) => setActiveStep(Math.round(v)),
          });
          // Hold
          await new Promise((r) => setTimeout(r, 2200));
        }
        // Reset back
        await animate(progress, 0, { duration: 0 });
        setActiveStep(0);
        await new Promise((r) => setTimeout(r, 600));
      }
    };
    runSequence();
    return () => { cancelled.current = true; };
  }, []);

  // Wheel position along the track (0% to 100%)
  const wheelLeft = useTransform(progress, [0, steps.length - 1], ["0%", "100%"]);
  // Wheel rotation for a rolling effect
  const wheelRotation = useTransform(progress, [0, steps.length - 1], [0, 720]);

  return (
    <div className="relative">
      {/* ── Track with rolling wheel ── */}
      <div className="relative mb-16">
        {/* Track line */}
        <div className="h-px bg-border w-full" />

        {/* Step tick marks + numbers */}
        <div className="relative flex justify-between -mt-[11px]">
          {steps.map((_, i) => {
            const isActive = activeStep === i;
            return (
              <div key={i} className="flex flex-col items-center">
                <motion.div
                  className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[9px] font-mono font-bold"
                  animate={{
                    borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: isActive ? "hsl(var(--primary))" : "transparent",
                    color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    scale: isActive ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {i + 1}
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Rolling wheel (travels along the track) */}
        <motion.div
          className="absolute top-0 -translate-y-1/2 -ml-3 pointer-events-none"
          style={{ left: wheelLeft }}
        >
          <motion.div
            className="w-6 h-6 rounded-full border-2 border-primary bg-background shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
            style={{ rotate: wheelRotation }}
          >
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-[5px] bg-primary/40" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Active Step Content ── */}
      <div className="min-h-[160px] flex items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="flex items-start gap-6 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                {(() => { const Icon = steps[activeStep].icon; return <Icon className="h-6 w-6 text-primary" />; })()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono font-bold text-primary/50 tracking-[0.2em] uppercase">Step {activeStep + 1}</span>
                  <div className="h-px w-8 bg-primary/20" />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">{steps[activeStep].title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{steps[activeStep].description}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Tiny step pills at bottom ── */}
      <div className="flex items-center justify-center gap-1.5 mt-12">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            animate={{
              width: activeStep === i ? 24 : 6,
              backgroundColor: activeStep === i ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
            transition={{ duration: 0.35 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─── */
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
            From first note to full knowledge base — here's how you go from scattered thoughts to organized understanding.
          </p>
        </motion.div>
      </section>

      <AnimatedDivider />

      {/* Step Reel */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Six steps to smarter notes</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Watch the workflow unfold — each step builds on the last.</p>
          </motion.div>
          <StepReel />
        </div>
      </section>

      <AnimatedDivider />

      {/* Why It Matters — staggered split layout */}
      <section className="py-28 overflow-hidden">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <span className="text-[10px] font-mono font-bold text-primary/50 tracking-[0.2em] uppercase">The Problem We Solve</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">Why it matters</h2>
            <p className="text-muted-foreground max-w-xl leading-relaxed">
              Traditional note-taking is broken. You write things down, file them away, and never look at them again.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">
            {[
              { title: "Active Recall, Not Passive Storage", desc: "AI-generated flashcards and summaries turn passive notes into active study materials. Research shows active recall improves retention by 50%.", accent: "172 50% 36%" },
              { title: "Connected Knowledge", desc: "Auto-linking creates a web of related concepts across your notebooks. When you write about quantum physics, it connects to your math notes.", accent: "32 80% 55%" },
              { title: "Zero Friction", desc: "No complex folder structures. No tagging taxonomies. Just write, and the AI handles organization. Your knowledge graph builds itself.", accent: "172 50% 36%" },
              { title: "Always Accessible", desc: "Instant search means you can find any idea in milliseconds. Whether it's a lecture from last semester or a meeting note from yesterday.", accent: "32 80% 55%" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold font-mono"
                    style={{ background: `hsl(${item.accent} / 0.1)`, color: `hsl(${item.accent})` }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Use Cases — horizontal scroll ticker */}
      <section className="bg-foreground/[0.02] py-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-accent/60 tracking-[0.2em] uppercase">Who It's For</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">Built for every kind of thinker</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm">No matter how you work, Notebook Archive adapts to you.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-card border border-border mx-auto mb-4 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  {uc.emoji}
                </div>
                <h3 className="font-serif text-sm font-bold text-foreground mb-1.5">{uc.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{uc.description}</p>
                <p className="text-[10px] text-primary/60 font-medium font-mono">{uc.extra}</p>
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

      <Footer />
    </div>
  );
}
