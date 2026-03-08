import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
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

/* ─── Cinematic 3-at-a-time Filmstrip ─── */
function StepReel() {
  const slideX = useMotionValue(0);
  const dotProgress = useMotionValue(0); // 0 = group 1, 1 = group 2
  const cancelled = useRef(false);
  const [group, setGroup] = useState(0);

  useEffect(() => {
    cancelled.current = false;
    const run = async () => {
      while (!cancelled.current) {
        // Show group 1 (steps 1-3)
        setGroup(0);
        await animate(slideX, 0, { duration: 0 });
        await animate(dotProgress, 0, { duration: 0 });
        await new Promise((r) => setTimeout(r, 1800));
        if (cancelled.current) return;

        // Slide to group 2 (steps 4-6)
        setGroup(1);
        animate(dotProgress, 1, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
        await animate(slideX, -50, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
        await new Promise((r) => setTimeout(r, 1800));
        if (cancelled.current) return;

        // Slide back to group 1
        setGroup(0);
        animate(dotProgress, 0, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
        await animate(slideX, 0, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
        await new Promise((r) => setTimeout(r, 400));
      }
    };
    run();
    return () => { cancelled.current = true; };
  }, []);

  const translateX = useTransform(slideX, (v) => `${v}%`);

  // Dot travels between two positions on the track line
  const dotLeft = useTransform(dotProgress, [0, 1], ["25%", "75%"]);
  const dotRotation = useTransform(dotProgress, [0, 1], [0, 360]);

  const DOT_SIZE = 22; // same as step circles

  return (
    <div className="relative">
      {/* ── Track line with dot indicators ── */}
      <div className="relative mb-12">
        {/* Line */}
        <div className="h-px bg-border w-full absolute top-1/2 -translate-y-1/2" />

        {/* Two group circles at fixed positions */}
        <div className="relative flex justify-between items-center" style={{ height: DOT_SIZE }}>
          {[0, 1].map((g) => (
            <div key={g} className="flex-1 flex justify-center">
              <motion.div
                className="rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-bold z-10"
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
                animate={{
                  borderColor: group === g ? "hsl(var(--primary))" : "hsl(var(--border))",
                  backgroundColor: group === g ? "hsl(var(--primary))" : "hsl(var(--background))",
                  color: group === g ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
                transition={{ duration: 0.3 }}
              >
                {g === 0 ? "1–3" : "4–6"}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Rolling dot */}
        <motion.div
          className="absolute top-1/2 z-20 pointer-events-none"
          style={{
            left: dotLeft,
            width: DOT_SIZE,
            height: DOT_SIZE,
            marginLeft: -(DOT_SIZE / 2),
            marginTop: -(DOT_SIZE / 2),
          }}
        >
          <motion.div
            className="w-full h-full rounded-full border-2 border-primary bg-background"
            style={{
              rotate: dotRotation,
              boxShadow: "0 0 10px hsl(var(--primary) / 0.35)",
            }}
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

      {/* ── Filmstrip: 6 cards, show 3 at a time ── */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          style={{ x: translateX, width: "200%" }}
        >
          {steps.map((step, idx) => (
            <div key={step.title} className="w-[calc(100%/6)] px-4 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom pills ── */}
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
      className="relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer select-none group min-h-[220px]"
    >
      {/* Blurred state — emoji + "tap to reveal" */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
        animate={{ opacity: revealed ? 0 : 1, filter: revealed ? "blur(8px)" : "blur(0px)" }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: revealed ? "none" : "auto" }}
      >
        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{uc.emoji}</span>
        <span className="font-serif text-base font-bold text-foreground mb-1">{uc.title}</span>
        <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase mt-2">Tap to reveal</span>
      </motion.div>

      {/* Revealed state — full content */}
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

      {/* Background glow on reveal */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
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

      {/* Use Cases — reveal cards */}
      <section className="bg-foreground/[0.02] py-28">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[10px] font-mono font-bold text-accent/60 tracking-[0.2em] uppercase">Who It's For</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3">Built for every kind of thinker</h2>
            <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm">Click to reveal who it's built for.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
