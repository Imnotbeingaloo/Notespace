import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Shield, Lightbulb, Target, Layers, ArrowRight, BookOpen, Eye, Sparkles } from "lucide-react";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { AnimatedHeading } from "@/components/AnimatedHeading";

const values = [
  { icon: Heart, title: "Built around the writer", description: "We design for the person staring at a blank page, not the slide where the feature gets shown off. If a thing doesn't help you write or find a note, it doesn't ship." },
  { icon: Zap, title: "Quiet by default", description: "Latency is a tax on thinking. Pages should open fast, the editor should never lag, and animations should know when to get out of the way." },
  { icon: Shield, title: "Your notes stay yours", description: "Encrypted in transit, scoped per user in the database, never sold, never used for training. The AI doesn't see a note unless you point at it." },
  { icon: Lightbulb, title: "AI as a second pair of eyes", description: "We use the model to explain, summarize, and tag — never to write the note for you. Your voice is the point of taking notes in the first place." },
];

const timeline = [
  { year: "2024 Q1", title: "The annoyance", description: "We kept bouncing between apps that were either too plain or too over-engineered. None of them helped us think; they just stored. So we sketched something else." },
  { year: "2024 Q3", title: "First usable build", description: "Markdown editor, notebooks, search. We put it in front of a small group, and what they kept asking for was the AI side, not more file management." },
  { year: "2025 Q1", title: "Explain shows up", description: "Streaming explanations beside the note, smart tags pulled from the prose itself, auto-summaries that don't lie about what's in the page." },
  { year: "2025 Q3", title: "Sharing & teams", description: "Shared notebooks for study groups and small teams. Quieter version of co-editing than most apps ship — designed to stay out of your way." },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function RevealCard({ emoji, label, title, titleHighlight, description, delay = 0 }: {
  emoji: string; label: string; title: string; titleHighlight?: string; description: string; delay?: number;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setRevealed(true)}
      className="group relative rounded-[2rem] border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-300 min-h-[260px]"
    >
      {/* Front face */}
      <motion.div
        animate={{ opacity: revealed ? 0 : 1, filter: revealed ? "blur(10px)" : "blur(0px)" }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none"
      >
        <span className="text-5xl mb-4">{emoji}</span>
        <p className="text-xs uppercase tracking-widest font-mono text-muted-foreground mb-2">{label}</p>
        <p className="font-serif text-xl font-bold text-foreground text-center">{titleHighlight ? <>{title} <span className="text-primary">{titleHighlight}</span></> : title}</p>
        <p className="text-xs text-muted-foreground mt-4 opacity-60">Tap to reveal</p>
      </motion.div>
      {/* Back face */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative z-10 p-8 h-full flex flex-col justify-center"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest font-mono text-primary mb-3">{label}</p>
          <p className="font-serif text-xl font-bold text-foreground mb-4">{titleHighlight ? <>{title} <span className="text-primary">{titleHighlight}</span></> : title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhilosophySection() {
  const [phase, setPhase] = useState<"old" | "transition" | "new">("old");
  const [blurry, setBlurry] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const TOTAL = 8000;
    const OLD_END = 3000;
    const TRANS_END = 4200;

    const cycle = () => {
      setPhase("old");
      setBlurry(false);
      setProgress(0);
      const t1 = setTimeout(() => { setPhase("transition"); setBlurry(true); }, OLD_END);
      const t2 = setTimeout(() => setPhase("new"), TRANS_END);
      return [t1, t2];
    };

    let timers = cycle();
    const interval = setInterval(() => {
      timers = cycle();
    }, TOTAL);

    let raf: number;
    let start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % TOTAL;
      setProgress(Math.min(elapsed / TOTAL, 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  const oldItems = ["Notes scattered across apps", "Ideas never link up", "You forget what's in there", "All the filing falls on you"];
  const newItems = [
    { text: "AI explains what you're writing", icon: "✨" },
    { text: "Tags link related notes for you", icon: "🔗" },
    { text: "Recall built into the editor", icon: "🎯" },
    { text: "The collection gets smarter over time", icon: "🌱" },
  ];

  return (
    <section className="bg-foreground/[0.03] py-24 overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest font-mono text-primary mb-3">Our philosophy</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">From storing notes to actually using them</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Two ways of working with a notebook, side by side.</p>
        </motion.div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-muted-foreground/40 via-primary to-primary"
              style={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors duration-500 ${phase === "old" ? "text-foreground font-semibold" : "text-muted-foreground/50"}`}>
              Old Way
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wider transition-colors duration-500 ${phase === "new" ? "text-primary font-semibold" : "text-muted-foreground/50"}`}>
              Notebook Archive
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-5 max-w-4xl mx-auto">
          {/* Old Way Card */}
          <motion.div
            animate={{
              opacity: blurry ? 0.3 : 1,
              scale: blurry ? 0.92 : 1,
              filter: blurry ? "grayscale(0.8) blur(1px)" : "grayscale(0) blur(0px)",
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full rounded-[2rem] border border-border bg-card p-7 md:p-8 relative overflow-hidden"
          >
            <motion.div
              animate={{ opacity: phase === "old" ? 0.06 : 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0 bg-destructive"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <motion.span
                  animate={{ scale: phase === "old" ? 1 : 0.8, opacity: phase === "old" ? 1 : 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl"
                >📁</motion.span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-destructive/70">The Old Way</p>
                  <motion.p
                    animate={{ opacity: phase === "new" ? 0.5 : 1 }}
                    className="font-serif text-lg font-bold text-foreground"
                  >Storing information</motion.p>
                </div>
              </div>
              <div className="space-y-3">
                {oldItems.map((item) => (
                  <motion.div
                    key={item}
                    animate={{
                      opacity: phase !== "old" ? 0.5 : 1,
                      textDecoration: phase !== "old" ? "line-through" : "none",
                    }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.span
                      animate={{ backgroundColor: phase === "new" ? "hsl(var(--destructive) / 0.4)" : "hsl(var(--muted-foreground) / 0.3)" }}
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                    />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex-shrink-0 flex items-center justify-center w-16 md:w-24 py-4 md:py-0">
            <motion.div
              animate={{
                color: phase !== "old" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)",
              }}
              transition={{ duration: 0.15 }}
            >
              <ArrowRight className="h-8 w-8 md:h-10 md:w-10 rotate-90 md:rotate-0" />
            </motion.div>
          </div>

          {/* New Way Card */}
          <motion.div
            animate={{
              opacity: phase === "old" ? 0.3 : 1,
              scale: phase === "old" ? 0.92 : 1,
              filter: phase === "old" ? "blur(1px)" : "blur(0px)",
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full rounded-[2rem] border-2 border-border bg-card p-7 md:p-8 relative overflow-hidden"
          >
            <motion.div
              animate={{ opacity: phase === "new" ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-accent/8"
            />
            <motion.div
              animate={{
                boxShadow: phase === "new"
                  ? "inset 0 0 30px hsl(var(--primary) / 0.08), 0 0 40px hsl(var(--primary) / 0.06)"
                  : "inset 0 0 0px transparent, 0 0 0px transparent",
              }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 rounded-[2rem]"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <motion.span
                  animate={{ scale: phase === "new" ? [1, 1.15, 1] : 0.8, opacity: phase === "new" ? 1 : 0.5 }}
                  transition={{ duration: phase === "new" ? 1.5 : 0.5, repeat: phase === "new" ? Infinity : 0, repeatDelay: 2 }}
                  className="text-3xl"
                >🧠</motion.span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-primary">The Notebook Archive Way</p>
                  <p className="font-serif text-lg font-bold text-foreground">Understanding <span className="text-primary">information</span></p>
                </div>
              </div>
              <div className="space-y-3">
                {newItems.map((item, i) => (
                  <motion.div
                    key={item.text}
                    animate={{
                      opacity: phase === "new" ? 1 : 0.4,
                      x: phase === "new" ? 0 : 4,
                    }}
                    transition={{ duration: 0.5, delay: phase === "new" ? i * 0.1 : 0 }}
                    className="flex items-center gap-2.5"
                  >
                    <motion.span
                      animate={{ scale: phase === "new" ? [1, 1.2, 1] : 0.8 }}
                      transition={{ duration: 0.4, delay: phase === "new" ? 0.3 + i * 0.1 : 0 }}
                      className="text-sm shrink-0"
                    >{item.icon}</motion.span>
                    <span className="text-sm text-foreground font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <>
      <SeoHead
        title="About — Notebook Archive"
        description="The mission and philosophy behind Notebook Archive: a focused, AI-augmented home for your thinking that respects your time and your privacy."
        path="/about"
      />
      <main className="min-h-screen bg-background">
        <PageHeader activePage="about" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Our Story</span>
            </div>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-4xl mx-auto">
              The <span className="text-primary">notebook</span> we always wanted to use
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Notebook Archive was built because no existing tool handled the fundamentals well. We are a small team building it for people who treat their notes as serious work.
            </p>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Mission & Approach — Zigzag layout */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl relative">
          {/* Center connector line — hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

          <div className="flex flex-col gap-16">
            {/* Mission — left */}
            <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-[2rem] border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06),transparent_70%)]" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our mission</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">The tool you use to think should be as sharp as your thinking. Most note apps treat your writing as static text in a folder; we treat it as something that responds and connects.</p>
                  <p className="text-muted-foreground leading-relaxed">Our goal is to build the calmest, most useful, and most private home for your work online.</p>
                </div>
              </motion.div>
              {/* Dot on the center line */}
              <div className="hidden md:flex items-center justify-start">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-3 h-3 rounded-full bg-primary border-2 border-background -ml-[18px]"
                />
              </div>
            </div>

            {/* Approach — right */}
            <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
              {/* Dot on the center line */}
              <div className="hidden md:flex items-center justify-end">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-3 h-3 rounded-full bg-accent border-2 border-background -mr-[18px]"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-[2rem] border border-border bg-card p-8 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent)/0.06),transparent_70%)]" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <Layers className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our approach</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">Features are not built to match competitors. They ship because an active user requested them, or because we encountered the gap ourselves.</p>
                  <p className="text-muted-foreground leading-relaxed">We ship small, frequent improvements. Our beta users are partners in the process.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Philosophy — Reveal Cards */}
      <PhilosophySection />

      <AnimatedDivider />

      {/* Values */}
      <section className="container mx-auto px-6 py-28 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our principles</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Four guiding values that shape how we build.</p>
        </motion.div>
        <div className="relative mt-12">
          <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="absolute left-4 top-0 bottom-0 w-px bg-border origin-top" />
          <div className="space-y-10">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="relative pl-12">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }} className="absolute left-1.5 top-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <v.icon className="h-3.5 w-3.5 text-primary" />
                </motion.div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Timeline */}
      <section className="bg-foreground/[0.03] py-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our journey</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A brief account of how we arrived here.</p>
          </motion.div>
          <div className="relative mt-12">
            <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="absolute left-4 top-0 bottom-0 w-px bg-border origin-top" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }} className="relative pl-12">
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.2, type: "spring", stiffness: 200 }} className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <span className="text-xs font-mono text-primary/70 font-semibold">{item.year}</span>
                  <h3 className="font-serif text-lg font-bold text-foreground mt-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* CTA */}
      <section className="bg-foreground/[0.04] py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Start writing with us
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              The app is free to use and we review every piece of feedback. If something is not working, let us know — and we will address it.
            </p>
            <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Open App" : "Open the app"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
      </main>
    </>
  );
}
