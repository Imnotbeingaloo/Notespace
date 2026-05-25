import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShufflerCard, TypewriterCard, SchedulerCard } from "@/components/AnimatedFeatureCards";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { ExitBookFlash } from "@/components/ExitBookFlash";

// Typing animation lines for the preview
const editorLines = [
  { text: "## Wave-Particle Duality", className: "text-foreground font-medium" },
  { text: "Light and matter exhibit properties of both waves and particles.", className: "text-muted-foreground" },
  { text: "This was demonstrated by the **double-slit experiment**.", className: "text-muted-foreground" },
  { text: "", className: "" },
  { text: "### Key Equations", className: "text-foreground font-medium" },
  { text: "- Energy: `E = hf`", className: "text-muted-foreground" },
  { text: "- De Broglie wavelength: `λ = h/p`", className: "text-muted-foreground" },
  { text: "- Schrödinger equation: `iℏ∂ψ/∂t = Ĥψ`", className: "text-muted-foreground" },
];

const navLinks = [
  { label: "Features", href: "#features", isAnchor: true },
  { label: "Pricing", href: "/pricing", isAnchor: false },
  { label: "About", href: "/about", isAnchor: false },
  { label: "How It Works", href: "/how-it-works", isAnchor: false },
];

export default function LandingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fromApp = (location.state as { fromApp?: boolean } | null)?.fromApp === true;
  const [showExitSplash, setShowExitSplash] = useState(fromApp);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [manuscriptTyped, setManuscriptTyped] = useState("");

  // Looping manuscript-card typewriter
  useEffect(() => {
    const SENTENCE = "Wave theory describes how energy propagates through space as oscillations.";
    let i = 0;
    let pause = 0;
    let phase: "typing" | "holding" | "resetting" = "typing";
    const id = setInterval(() => {
      if (pause > 0) { pause--; return; }
      if (phase === "typing") {
        i++;
        setManuscriptTyped(SENTENCE.slice(0, i));
        if (i >= SENTENCE.length) { phase = "holding"; pause = 70; }
      } else if (phase === "holding") {
        phase = "resetting";
        pause = 6;
      } else {
        i = 0;
        setManuscriptTyped("");
        phase = "typing";
        pause = 8;
      }
    }, 45);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (fromApp) {
      // Clear state so refreshes don't replay the splash
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // When animation finishes, restart after 3 seconds
    if (visibleLines >= editorLines.length) {
      const restartTimeout = setTimeout(() => {
        setVisibleLines(0);
        setTypingText("");
        setCurrentCharIndex(0);
      }, 3000);
      return () => clearTimeout(restartTimeout);
    }

    const currentLine = editorLines[visibleLines];

    // Empty lines — just pause briefly then advance
    if (currentLine.text === "") {
      const timeout = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setTypingText("");
        setCurrentCharIndex(0);
      }, 250);
      return () => clearTimeout(timeout);
    }

    // Typing in progress — use rAF for smooth, consistent rendering
    if (currentCharIndex < currentLine.text.length) {
      let rafId: number;
      let lastTime = 0;
      const charDelay = 40; // ms per character

      const step = (timestamp: number) => {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;
        if (elapsed >= charDelay) {
          lastTime = timestamp;
          setCurrentCharIndex((c) => {
            const next = c + 1;
            setTypingText(currentLine.text.slice(0, next));
            return next;
          });
        }
        rafId = requestAnimationFrame(step);
      };

      rafId = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId);
    }

    // Line complete — advance immediately to next line
    const nextLine = editorLines[visibleLines + 1];
    const timeout = setTimeout(() => {
      setVisibleLines((v) => v + 1);
      if (nextLine && nextLine.text !== "") {
        setTypingText(nextLine.text.slice(0, 1));
        setCurrentCharIndex(1);
      } else {
        setTypingText("");
        setCurrentCharIndex(0);
      }
    }, 60);
    return () => clearTimeout(timeout);
  }, [visibleLines, currentCharIndex]);

  return (
    <>
      {showExitSplash && <ExitBookFlash onDone={() => setShowExitSplash(false)} />}
      <div className="min-h-screen bg-background" style={showExitSplash ? { visibility: "hidden" } : undefined}>
      {/* ── Floating Navbar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl transition-all duration-500 rounded-2xl ${
          scrolled ? "border border-border bg-background/70 backdrop-blur-xl shadow-lg shadow-primary/5" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-3 md:gap-6 px-3 sm:px-5 py-3">
           <Link to="/" className="flex items-center gap-2 pb-1 min-w-0 shrink-0">
              <img src="/logo.png" alt="Notebook Archive" className="h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0" />
              <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-foreground translate-y-[1px] whitespace-nowrap">Notebook Archive</span>
           </Link>
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 shrink-0">
            {navLinks.map((link) =>
              link.isAnchor ? (
                <a key={link.label} href={link.href} className="px-2.5 lg:px-3 py-1.5 rounded-xl text-[13px] lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 whitespace-nowrap">{link.label}</a>
              ) : (
                <Link key={link.label} to={link.href} className="px-2.5 lg:px-3 py-1.5 rounded-xl text-[13px] lg:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 whitespace-nowrap">{link.label}</Link>
              )
            )}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <Link to="/app" className="magnetic-btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap">
                Open App <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign In</Link>
                <Link to="/auth" className="magnetic-btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap">
                  Get Started <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border/50 overflow-hidden bg-background/95 backdrop-blur-xl rounded-b-2xl">
              <nav className="flex flex-col gap-1 p-3">
                {navLinks.map((link) =>
                  link.isAnchor ? (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{link.label}</a>
                  ) : (
                    <Link key={link.label} to={link.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{link.label}</Link>
                  )
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Hero (editorial) ── */}
      <section className="relative overflow-hidden pt-40 md:pt-44 pb-20 min-h-[88vh] flex items-center bg-muted/40">
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left: headline column */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                  A Note-Taker That Thinks With You
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-serif text-[2rem] md:text-[2.6rem] lg:text-[3.25rem] font-bold text-foreground leading-[1.05] tracking-tight"
              >
                Your thoughts,{" "}
                <span className="italic text-primary">organized</span>
                {" & "}
                <span className="italic text-primary">understood</span>
                <span className="text-foreground">.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                A quiet place to write, link, and revisit your ideas — with intelligence woven in only where it actually helps.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                  {user ? "Open App" : "Start writing"} <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#features" className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline">
                  See what it does
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground/70"
              >
                No credit card · Free forever tier
              </motion.p>
            </div>

            {/* Right: manuscript vignette */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative mx-auto max-w-sm"
              >
                {/* Peeking second page (depth) */}
                <div
                  aria-hidden
                  className="absolute -top-3 -left-3 right-6 bottom-10 rounded-2xl border border-border/60 bg-card/60 shadow-md -rotate-[3deg] -z-10"
                />

                {/* Paper card */}
                <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/[0.06] -rotate-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-3">
                    §  Chapter One
                  </div>
                  <div className="font-serif text-xl font-bold text-foreground mb-4">
                    On wave theory
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-[3px] w-[92%] rounded-full bg-border/70" />
                    <div className="h-[3px] w-[78%] rounded-full bg-border/70" />
                    {/* Animated highlight sweep */}
                    <div className="relative h-[6px] w-[88%] rounded-sm bg-border/40 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-primary/40 to-primary/20"
                        initial={{ width: "0%" }}
                        animate={{ width: ["0%", "100%", "100%", "0%"] }}
                        transition={{
                          duration: 8,
                          times: [0, 0.35, 0.85, 1],
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.8,
                        }}
                      />
                    </div>
                    <div className="h-[3px] w-[70%] rounded-full bg-border/70" />
                    <div className="h-[3px] w-[55%] rounded-full bg-border/70" />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      # physics
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">p.14</span>
                  </div>
                </div>

                {/* Floating Explain popover with looping typewriter */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="absolute -bottom-8 -right-4 sm:-right-8 w-60 rounded-xl border border-primary/20 bg-background/95 backdrop-blur p-3.5 shadow-2xl shadow-primary/10 rotate-2"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
                      Explain
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed min-h-[3.6rem]">
                    {manuscriptTyped}
                    <span className="inline-block w-[2px] h-3 bg-primary ml-0.5 align-middle animate-pulse" />
                  </p>
                </motion.div>

                {/* VOL. 01 side note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="mt-16 flex justify-end"
                >
                  <div className="flex gap-3 max-w-[14rem]">
                    <div className="w-px bg-border" />
                    <div>
                      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70 mb-1.5">
                        Vol. 01
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A writing tool for people who think on the page — and want their notes to think back.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section className="relative border-t border-border/60 bg-background">
        <div className="container mx-auto px-6 pt-20 md:pt-28 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Notebook Archive</span>
          </div>
          <div className="flex min-h-[420px]">
            <div className="w-56 border-r border-border bg-sidebar p-4 hidden md:block">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-serif text-sm font-bold text-foreground">My Notebooks</span>
              </div>
              <div className="space-y-1">
                {[
                  { emoji: "📓", name: "Physics Notes", active: true },
                  { emoji: "📗", name: "Biology Lab", active: false },
                  { emoji: "📘", name: "History Essay", active: false },
                  { emoji: "📙", name: "CS Algorithms", active: false },
                ].map((item) => (
                  <motion.div key={item.name} whileHover={{ x: 2 }} className={`px-3 py-2 rounded-xl text-xs cursor-default transition-colors ${item.active ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>
                    {item.emoji} {item.name}
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Smart Tags</p>
                <div className="flex flex-wrap gap-1">
                  {["#physics", "#quantum", "#waves"].map((tag) => (
                    <span key={tag} className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Study Planner</p>
                <div className="space-y-1.5">
                  {[
                    { day: "Today", topic: "Quantum Mechanics" },
                    { day: "Tomorrow", topic: "Biology Lab Report" },
                    { day: "Wed", topic: "History Essay Draft" },
                  ].map((s) => (
                    <div key={s.day} className="flex items-center gap-2 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-muted-foreground">{s.day}:</span>
                      <span className="text-foreground truncate">{s.topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8">
              <h2 className="font-serif text-xl font-bold text-foreground mb-1">Quantum Mechanics Intro</h2>
              <p className="text-xs text-muted-foreground mb-5">Updated Jan 15, 2:30 PM</p>
              <div className="space-y-1.5 text-sm leading-relaxed">
                {editorLines.slice(0, visibleLines).map((line, i) => (
                  <p key={i} className={line.className}>
                    {line.text || "\u00A0"}
                  </p>
                ))}
                {visibleLines < editorLines.length && (
                  <p className={editorLines[visibleLines]?.className}>
                    {typingText}
                    <span className="inline-block w-[2px] h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* ── Features ── */}
      <section id="features" className="relative py-20">
        <div className="absolute inset-0 bg-foreground/[0.04] pointer-events-none" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial="show"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
            className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto items-stretch"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <ShufflerCard />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <TypewriterCard />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <SchedulerCard />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* ── How It Works Mini ── */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Simple to start, <span className="text-primary">powerful</span> as you grow
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Getting started takes less than a minute. No complex setup, no steep learning curve — just open, write, and let the AI handle the rest.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Tag filtering", desc: "Organize your knowledge with a powerful tagging system. Find exactly what you need in seconds with smart filters and search." },
              { step: "2", title: "Note templates", desc: "Jumpstart your thinking with pre-built structures for lectures, meetings, and research. Standardize your note-taking effortlessly." },
              { step: "3", title: "Pomodoro timer", desc: "Stay focused and productive with a built-in focus timer. Balance deep work sessions with scheduled breaks to maximize learning." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">{item.step}</div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* ── Testimonials ── */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/[0.03] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Trusted by <span className="text-accent">professionals</span> and students
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              See why researchers, students, and teams choose Notebook Archive over traditional note-taking tools. Real feedback from real users who've made the switch.
            </p>
          </motion.div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto mt-12">
            {[
              { quote: "Finally a note app that actually helps me understand what I'm writing, not just store it. The AI explanations are genuinely useful — it's like having a tutor on standby.", name: "Sarah K.", role: "PhD Researcher", emoji: "🔬" },
              { quote: "The AI explanations saved me during finals. It's like having a tutor built into my notebook. I can't go back to plain editors after experiencing this workflow.", name: "Marcus L.", role: "Computer Science Student", emoji: "🎓" },
              { quote: "Our team switched from Notion and haven't looked back. The instant search and shared notebooks changed how we collaborate across time zones.", name: "Priya T.", role: "Product Manager", emoji: "💼" },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30, rotate: -1 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, type: "spring", stiffness: 150 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-[1.5rem] md:rounded-[2rem] border border-border bg-card p-5 md:p-8 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
              >
                <span className="text-2xl mb-4 block">{t.emoji}</span>
                <p className="text-sm text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      {/* ── CTA ── */}
      <section className="bg-foreground/[0.04] py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to organize your thinking?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Join thousands who've made Notebook Archive their thinking companion. Free forever — no credit card required.
            </p>
            <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Open App" : "Get Started — It's Free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
      </div>
    </>
  );
}
