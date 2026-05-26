import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, animate, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PenLine, FolderOpen, Sparkles, Search, Brain, FileOutput } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";

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

/* ─── Animation helpers ─── */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

/* ─── Cinematic Step Reel ─── */
function StepReel() {
  const slideX = useMotionValue(0);
  const dotX = useMotionValue(0);
  const dotScale = useMotionValue(1);
  const cancelled = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [group, setGroup] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const DOT_SIZE = 32;

  const measureCircleX = useCallback((idx: number): number => {
    const viewport = viewportRef.current;
    const circle = circleRefs.current[idx];
    if (!viewport || !circle) return 0;
    const vRect = viewport.getBoundingClientRect();
    const cRect = circle.getBoundingClientRect();
    return cRect.left + cRect.width / 2 - vRect.left;
  }, []);

  const snapPulse = useCallback(async () => {
    await animate(dotScale, 1.35, { duration: 0.12, ease: "easeOut" });
    await animate(dotScale, 1, { duration: 0.18, ease: "easeInOut" });
  }, [dotScale]);

  const moveToStep = useCallback(async (idx: number, duration = 0.7) => {
    if (cancelled.current) return;
    setActiveStep(idx);
    await animate(dotX, measureCircleX(idx), { duration, ease: [0.16, 1, 0.3, 1] });
  }, [dotX, measureCircleX]);

  useEffect(() => {
    cancelled.current = false;

    const startTimeout = setTimeout(() => {
      const run = async () => {
        while (!cancelled.current) {
          // ── Group 0 (steps 0,1,2) ──
          setGroup(0);
          setActiveStep(0);
          await animate(slideX, 0, { duration: 0 });
          await nextFrame();
          await nextFrame();
          dotX.set(measureCircleX(0));
          dotScale.set(1);
          await wait(900);

          if (cancelled.current) return;
          await moveToStep(1);
          await wait(900);

          if (cancelled.current) return;
          await moveToStep(2);
          await wait(900);

          // ── Slide to Group 1 (steps 3,4,5) ──
          if (cancelled.current) return;
          setGroup(1);
          setActiveStep(3);
          const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
          const dotStartX = dotX.get();
          await Promise.all([
            animate(slideX, -viewportWidth, { duration: 0.35, ease: [0.16, 1, 0.3, 1] }),
            animate(dotX, dotStartX - viewportWidth, { duration: 0.35, ease: [0.16, 1, 0.3, 1] }),
          ]);
          await nextFrame();
          await animate(dotX, measureCircleX(3), { duration: 0.12, ease: [0.16, 1, 0.3, 1] });
          await wait(900);

          if (cancelled.current) return;
          await moveToStep(4);
          await wait(900);

          if (cancelled.current) return;
          await moveToStep(5);
          await wait(1100);

          // ── Reset: slide back to group 0, dot appears at step 0 ──
          if (cancelled.current) return;
          setGroup(0);
          setActiveStep(0);
          await animate(slideX, 0, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
          await nextFrame();
          dotX.set(measureCircleX(0));
          await wait(600);
        }
      };
      run();
    }, 200);

    return () => {
      cancelled.current = true;
      clearTimeout(startTimeout);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={viewportRef} className="overflow-hidden relative pt-2">
        {/* Sliding dot */}
        <motion.div
          className="absolute top-2 z-30 pointer-events-none"
          style={{
            x: dotX,
            scale: dotScale,
            width: DOT_SIZE,
            height: DOT_SIZE,
            marginLeft: -(DOT_SIZE / 2),
          }}
        >
          <div className="w-full h-full rounded-full border-2 border-primary bg-background animate-pulse-glow">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>
        </motion.div>

        {/* Filmstrip */}
        <motion.div
          className="flex relative"
          style={{ x: slideX, width: "200%" }}
        >
          {/* Continuous rail line connecting circles (starts at first circle center) */}
          <div className="absolute top-[18px] h-px bg-border z-0" style={{ left: 'calc(100% / 12)', right: 0 }} />

          {steps.map((step, idx) => (
            <div key={step.title} className="w-[calc(100%/6)] px-3 md:px-8 flex-shrink-0 text-left">
              <div className="flex items-center mb-6 relative">
                <motion.div
                  ref={(el) => { circleRefs.current[idx] = el; }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 flex-shrink-0"
                  animate={{
                    backgroundColor: activeStep === idx ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    color: activeStep === idx ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    scale: activeStep === idx ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                >
                  {idx + 1}
                </motion.div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <step.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-serif text-base md:text-xl font-bold text-foreground mb-1 md:mb-2">{step.title}</h3>
              <p className="text-xs md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-10">
        {[0, 1].map((g) => (
          <motion.div
            key={g}
            className="h-1.5 rounded-full"
            animate={{
              width: group === g ? 28 : 8,
              backgroundColor: group === g ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Reveal Card ─── */
function RevealCard({ uc, index }: { uc: typeof useCases[0]; index: number }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setRevealed(!revealed)}
      className="relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer select-none group min-h-[180px] md:min-h-[200px]"
    >
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
        animate={{ opacity: revealed ? 0 : 1, filter: revealed ? "blur(8px)" : "blur(0px)" }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: revealed ? "none" : "auto" }}
      >
        <span className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{uc.emoji}</span>
        <span className="font-serif text-sm md:text-base font-bold text-foreground mb-1">{uc.title}</span>
        <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase mt-2">Tap to reveal</span>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex flex-col justify-between p-6 z-10"
        animate={{ opacity: revealed ? 1 : 0, filter: revealed ? "blur(0px)" : "blur(6px)" }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: revealed ? "auto" : "none" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{uc.emoji}</span>
            <h3 className="font-serif text-sm font-bold text-foreground">{uc.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{uc.description}</p>
        </div>
        <p className="text-[10px] text-primary font-medium font-mono mt-4">{uc.extra}</p>
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
}

/* ─── Zigzag Item ─── */
const zigzagItems = [
  { title: "Active Recall, Not Passive Storage", desc: "AI-generated flashcards and summaries turn passive notes into active study materials. Research shows active recall improves retention by 50%.", icon: Brain },
  { title: "Connected Knowledge", desc: "Auto-linking creates a web of related concepts across your notebooks. When you write about quantum physics, it connects to your math notes.", icon: Sparkles },
  { title: "Zero Friction", desc: "No complex folder structures. No tagging taxonomies. Just write, and the AI handles organization. Your knowledge graph builds itself.", icon: PenLine },
  { title: "Always Accessible", desc: "Instant search means you can find any idea in milliseconds. Whether it's a lecture from last semester or a meeting note from yesterday.", icon: Search },
];

function ZigzagCard({ item, index }: { item: typeof zigzagItems[0]; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex flex-col md:flex-row items-center gap-6 md:gap-12 mb-20 last:mb-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      {/* Content card */}
      <div className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"}`}>
        <motion.div
          className="relative rounded-2xl border border-border bg-card p-6 md:p-8 group overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.25 }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06)_0%,transparent_70%)] pointer-events-none" />
          <h3 className="relative font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
          <p className="relative text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
        </motion.div>
      </div>

      {/* Center icon dot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 + 0.3, ease: "backOut" }}
        className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center"
      >
        <item.icon className="h-5 w-5 text-primary" />
      </motion.div>

      {/* Spacer */}
      <div className="flex-1 hidden md:block" />
    </motion.div>
  );
}

/* ─── Page ─── */
export default function HowItWorksPage() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const headingY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  return (
    <>
      <SeoHead
        title="How it works — Notebook Archive"
        description="From first note to a full knowledge base: a step-by-step walk-through of how Notebook Archive turns scattered thoughts into organized understanding."
        path="/how-it-works"
      />
      <main className="min-h-screen bg-background">
        <PageHeader activePage="how-it-works" />

      {/* Hero with parallax */}
      <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16">
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <motion.div style={{ y: badgeY }} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Get Started in Minutes
            </motion.div>
            <motion.h1 style={{ y: headingY }} className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              How Notebook Archive <span className="text-primary">works</span>
            </motion.h1>
            <motion.p style={{ y: subtitleY }} className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From first note to full knowledge base — here's how you go from scattered thoughts to organized understanding.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Step Reel */}
      <section className="py-16 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 md:mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Six steps to smarter notes</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Watch the workflow unfold — each step builds on the last.</p>
          </motion.div>
          <StepReel />
        </div>
      </section>

      <AnimatedDivider />

      {/* Why It Matters — zigzag */}
      <section className="py-16 md:py-28 overflow-hidden">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 md:mb-20">
            <span className="text-[10px] font-mono font-bold text-primary/50 tracking-[0.2em] uppercase">The Problem We Solve</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">Why it matters</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Traditional note-taking is broken. You write things down, file them away, and never look at them again.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
            {zigzagItems.map((item, i) => (
              <ZigzagCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Use Cases */}
      <section className="bg-foreground/[0.02] py-16 md:py-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-accent/60 tracking-[0.2em] uppercase">Who It's For</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">Built for every kind of thinker</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm">Click to reveal who it's built for.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCases.map((uc, i) => (
              <RevealCard key={uc.title} uc={uc} index={i} />
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* CTA */}
      <section className="bg-foreground/[0.04] py-20">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-to-br from-primary/15 via-card to-accent/15 border border-border p-8 md:p-12 text-center max-w-3xl mx-auto">
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
