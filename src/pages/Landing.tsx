import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShufflerCard, TypewriterCard, SchedulerCard } from "@/components/AnimatedFeatureCards";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { ExitBookFlash } from "@/components/ExitBookFlash";
import { SeoHead } from "@/components/SeoHead";

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

// Render inline markdown: **bold**, *italic* (formulas in backticks are left as raw text)
function renderInline(text: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) tokens.push(text.slice(lastIndex, match.index));
    if (match[2] !== undefined) {
      tokens.push(
        <strong
          key={key++}
          className="font-semibold text-foreground inline-block animate-in zoom-in-95 duration-300 ease-out origin-left"
          style={{ willChange: "transform" }}
        >
          {match[2]}
        </strong>
      );
    } else if (match[3] !== undefined) {
      tokens.push(<em key={key++}>{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) tokens.push(text.slice(lastIndex));
  return tokens;
}

function RenderMarkdownLine({ text }: { text: string }) {
  const isHeading = text.startsWith("# ") || text.startsWith("## ") || text.startsWith("### ");

  const inner = (() => {
    if (text === "") return <p>{"\u00A0"}</p>;
    if (text.startsWith("### ")) {
      return <h3 className="font-serif text-base font-bold text-foreground mt-2">{renderInline(text.slice(4))}</h3>;
    }
    if (text.startsWith("## ")) {
      return <h3 className="font-serif text-lg font-bold text-foreground mt-2">{renderInline(text.slice(3))}</h3>;
    }
    if (text.startsWith("# ")) {
      return <h2 className="font-serif text-xl font-bold text-foreground mt-2">{renderInline(text.slice(2))}</h2>;
    }
    return <p className="text-muted-foreground">{renderInline(text)}</p>;
  })();

  if (!isHeading) return <div>{inner}</div>;
  return (
    <div
      className="animate-in zoom-in-95 duration-300 ease-out origin-left"
      style={{ willChange: "transform" }}
    >
      {inner}

    </div>
  );
}


const navLinks = [
  { label: "Features", href: "/features", isAnchor: false },
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
    // Arm the splash so it plays the next time the user crosses into /home or /app.
    // Direct deep links bypass the Landing page and therefore won't trigger it.
    try { sessionStorage.setItem("playSplash", "1"); } catch {}
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

    // Empty lines - just pause briefly then advance
    if (currentLine.text === "") {
      const timeout = setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setTypingText("");
        setCurrentCharIndex(0);
      }, 250);
      return () => clearTimeout(timeout);
    }

    // Typing in progress - use rAF for smooth, consistent rendering
    if (currentCharIndex < currentLine.text.length) {
      let rafId: number;
      let lastTime = 0;
      const charDelay = 75; // ms per character

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

    // Line complete - advance immediately to next line
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
      <SeoHead
        title="Notespace - AI Study Planner & Notes App"
        description="AI study planner and note taking app for students, writers, and researchers. Plan sessions, organize notebooks, and get AI help where it matters."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Notespace",
            url: "https://notebookarchive.lovable.app/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://notebookarchive.lovable.app/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Notespace",
            url: "https://notebookarchive.lovable.app/",
            logo: "https://notebookarchive.lovable.app/logo.png",
            sameAs: [
              "https://www.producthunt.com/products/notebook-archive",
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Notespace",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "Web",
            url: "https://notebookarchive.lovable.app/",
            description: "Notespace is an AI study planner and note taking app: build a study schedule per notebook, organize lecture and research notes, search across everything, and export to Markdown.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          },
        ]}
      />
      <AnimatePresence>
        {showExitSplash && <ExitBookFlash key="exit-splash" onDone={() => setShowExitSplash(false)} />}
      </AnimatePresence>
      <main className="min-h-screen bg-background">
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
            <Link to="/" className="flex items-center gap-2 pb-1 min-w-0 shrink-0 group">
               <img src="/logo.png" alt="Notespace" width={32} height={32} loading="eager" decoding="sync" {...({ fetchpriority: "high" } as any)} className="h-[1.224rem] w-[1.224rem] object-contain shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
               <span className="font-serif text-sm sm:text-base md:text-lg font-bold text-foreground translate-y-[1px] whitespace-nowrap">Notespace</span>
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {user ? (
              <Link to="/home" className="magnetic-btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap">
                Open App <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden lg:inline-flex text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 lg:px-3 py-1.5 whitespace-nowrap">Sign In</Link>
                <Link to="/auth" className="magnetic-btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 whitespace-nowrap">
                  Get Started <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} className="md:hidden p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0">
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
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
      <section className="relative overflow-hidden pt-28 md:pt-32 lg:pt-36 pb-16 lg:pb-20 lg:min-h-[78vh] flex items-center bg-muted/40">
        <div className="container mx-auto px-6 relative">
          <div className="grid md:grid-cols-12 gap-10 md:gap-8 lg:gap-10 items-start">
            {/* Left: headline column */}
            <div className="md:col-span-7">
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

              {/*
                HERO COPY LOCK - do not change without explicit user request.
                Headline copy, italic words, paragraph text and the text-size
                classes below are intentionally pinned. The fixed max-width +
                min-height keep the hero from reflowing the layout if copy
                ever changes accidentally.
              */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-[18ch]"
              >
                Your thoughts,{" "}
                <span className="italic text-primary inline-block pr-1.5">organized</span>
                {" & "}
                <span className="italic text-primary inline-block pr-1.5">understood</span>
                <span className="text-foreground">.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                A quiet place to write, link, and revisit your thinking - with intelligence woven in only where it actually helps.
              </motion.p>


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <Link to={user ? "/home" : "/auth"} className="magnetic-btn w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-[15px] lg:px-8 lg:py-3.5 lg:text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                  {user ? "Open App" : "Start writing"} <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                </Link>
                <Link to="/features" className="magnetic-btn w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-2xl border border-foreground/20 bg-muted px-5 py-2.5 text-sm md:px-6 md:py-3 md:text-[15px] lg:px-8 lg:py-3.5 lg:text-base font-semibold text-foreground hover:bg-muted/70 transition-colors">
                  See what it does
                </Link>

              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="mt-6 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground"
              >
                No credit card required
              </motion.p>
            </div>

            {/* Right: manuscript vignette - desktop only */}
            <div className="hidden md:block md:col-span-5 relative md:pt-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative mx-auto max-w-md group"
              >
                {/* Paper card */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="relative rounded-2xl border border-border bg-card p-7 shadow-xl shadow-primary/[0.08] -rotate-1 cursor-default hover:shadow-2xl hover:shadow-primary/15 transition-shadow duration-500"
                >
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                    CHAPTER ONE
                  </div>
                  <div className="font-serif text-lg md:text-xl font-bold text-foreground mb-5 leading-tight">
                    On wave theory
                  </div>
                  <div className="space-y-3">
                    {[
                      { width: "92%", delay: 0 },
                      { width: "78%", delay: 8 },
                      { width: "88%", delay: 16 },
                      { width: "70%", delay: 24 },
                      { width: "55%", delay: 32 },
                    ].map((line, i) => (
                      <div
                        key={i}
                        className="relative h-[4px] rounded-full bg-border overflow-hidden"
                        style={{ width: line.width }}
                      >
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/60 to-primary/30"
                          initial={{ width: "0%" }}
                          animate={{ width: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 8,
                            times: [0, 0.625, 1],
                            repeat: Infinity,
                            repeatDelay: 32,
                            ease: "easeInOut",
                            delay: line.delay,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      # physics
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">p.14</span>
                  </div>
                </motion.div>

                {/* Floating Explain popover with looping typewriter */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-10 w-64 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/10 rotate-1"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-primary">
                      Explain
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed min-h-[3.6rem]">
                    {manuscriptTyped}
                    <span className="inline-block w-[2px] h-3 bg-primary ml-0.5 align-middle animate-pulse" />
                  </p>
                </motion.div>





              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section className="relative border-t border-border bg-background">
        <div className="container mx-auto px-6 pt-20 md:pt-28 pb-32">
        <div className="relative max-w-7xl mx-auto">







        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-[2rem] border-2 border-border/80 ring-1 ring-foreground/5 bg-card shadow-2xl shadow-primary/5 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Notespace</span>
          </div>
          <div className="flex min-h-[560px]">
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
                  <RenderMarkdownLine key={i} text={line.text} />
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

      {/* ── How It Works — Heritage Editorial Deck ── */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center mb-20 md:mb-24">
            <div className="inline-block mb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent bg-accent/5 px-3 py-1 border border-accent/20 rounded-full">
                Functional Excellence
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-[1.15] font-bold">
              Simple to start.
              <span className="block font-normal text-muted-foreground">Powerful when you need it.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { step: "01", title: "Tag filtering", desc: "Add a #tag anywhere in a note and it surfaces in the sidebar. Click it to retrieve every related note instantly.", tape: "left-8 -rotate-2 bg-amber-300/55 border-amber-500/40", offset: "", num: "text-amber-700", rule: "bg-amber-600/50" },
              { step: "02", title: "Note templates", desc: "Start from a structured layout for lectures, meetings, or reviews — then adapt it to your workflow.", tape: "left-1/2 -translate-x-1/2 rotate-1 bg-emerald-300/45 border-emerald-600/40", offset: "md:mt-8", num: "text-emerald-800", rule: "bg-emerald-700/45" },
              { step: "03", title: "Pomodoro timer", desc: "A focused 25/5 timer lives in the corner. Begin a session, take the break, and track your progress.", tape: "right-8 -rotate-1 bg-slate-400/40 border-slate-500/40", offset: "", num: "text-slate-600", rule: "bg-slate-500/50" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative ${item.offset}`}
              >
                {/* Tape detail */}
                <div className={`absolute -top-4 w-20 h-8 border shadow-[0_2px_6px_-2px_hsl(var(--foreground)/0.15)] backdrop-blur-[1px] z-10 hidden md:block ${item.tape}`} />

                <div className="relative bg-card border border-border/60 p-10 pt-12 shadow-[0_15px_40px_-15px_hsl(var(--foreground)/0.08)] transition-all duration-500 group-hover:shadow-[0_25px_50px_-12px_hsl(var(--foreground)/0.12)] group-hover:-translate-y-1">
                  {/* Number with per-card accent */}
                  <div className={`font-mono ${item.num} text-sm mb-8 flex items-center gap-3`}>
                    <span className={`w-8 h-px ${item.rule}`} />
                    {item.step}
                  </div>

                  <h3 className="font-serif text-2xl text-foreground mb-4">{item.title}</h3>

                  <p className="font-sans text-muted-foreground leading-relaxed text-[15px]">
                    {item.desc}
                  </p>

                  {/* Ruled line decoration */}
                  <div className="mt-8 space-y-3">
                    <div className="h-px w-full bg-border/60" />
                    <div className="h-px w-3/4 bg-border/60" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <AnimatedDivider />

      {/* ── Testimonials — Infinite Marquee ── */}
      <section className="relative py-28 overflow-hidden bg-[hsl(var(--accent)/0.06)] border-y border-accent/20">
        {/* Center ornament on the top rule */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 bg-background">
          <span className="h-px w-6 bg-accent/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
          <span className="h-px w-6 bg-accent/40" />
        </div>
        {/* Center ornament on the bottom rule */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center gap-2 px-4 bg-foreground/[0.04]">
          <span className="h-px w-6 bg-accent/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
          <span className="h-px w-6 bg-accent/40" />
        </div>
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              What the&nbsp;<span className="text-accent">Users</span>&nbsp;are saying
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Notes from researchers, students, and small teams who made the switch.
            </p>
          </motion.div>
        </div>

        {/* Marquee track */}
        <div className="relative group">
          {/* edge fades — tinted to match the warm section bg */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10 bg-gradient-to-r from-[hsl(var(--accent)/0.14)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10 bg-gradient-to-l from-[hsl(var(--accent)/0.14)] to-transparent" />



          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] gap-6 px-6">
            {[
              { quote: "The first note-taking tool that genuinely engages with what I write. The Explain panel adds real value to my research workflow.", name: "Sarah K.", role: "PhD Researcher", emoji: "🔬" },
              { quote: "Indispensable during finals. Highlighting a concept and receiving a clear explanation is far more efficient than searching elsewhere.", name: "Marcus L.", role: "Computer Science Student", emoji: "🎓" },
              { quote: "We migrated our team documentation from another platform. The search alone justified the move — I find information in seconds.", name: "Priya T.", role: "Product Manager", emoji: "💼" },
              { quote: "I've tried every note app on the market. Notespace is the only one that feels like a tool built for thinking, not for shipping features.", name: "Daniel R.", role: "Independent Writer", emoji: "✍️" },
              { quote: "My lab notebook, meeting notes, and paper drafts all live here now. The tag filter alone replaced three other subscriptions.", name: "Amara O.", role: "Neuroscience Postdoc", emoji: "🧠" },
            ].concat([
              { quote: "The first note-taking tool that genuinely engages with what I write. The Explain panel adds real value to my research workflow.", name: "Sarah K.", role: "PhD Researcher", emoji: "🔬" },
              { quote: "Indispensable during finals. Highlighting a concept and receiving a clear explanation is far more efficient than searching elsewhere.", name: "Marcus L.", role: "Computer Science Student", emoji: "🎓" },
              { quote: "We migrated our team documentation from another platform. The search alone justified the move — I find information in seconds.", name: "Priya T.", role: "Product Manager", emoji: "💼" },
              { quote: "I've tried every note app on the market. Notespace is the only one that feels like a tool built for thinking, not for shipping features.", name: "Daniel R.", role: "Independent Writer", emoji: "✍️" },
              { quote: "My lab notebook, meeting notes, and paper drafts all live here now. The tag filter alone replaced three other subscriptions.", name: "Amara O.", role: "Neuroscience Postdoc", emoji: "🧠" },
            ]).map((t, i) => (
              <div
                key={i}
                className="shrink-0 w-[300px] md:w-[360px] rounded-[1.5rem] md:rounded-[2rem] border border-border bg-card p-6 md:p-8 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
              >
                <span className="text-2xl mb-4 block">{t.emoji}</span>
                <p className="text-sm text-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <AnimatedDivider />

      {/* ── CTA ── */}
      <section className="border-t border-border bg-foreground/[0.04] py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] bg-gradient-to-br from-primary/8 via-card to-accent/8 border border-border p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to think more clearly?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              The free plan is the full product - no credit card, no trial timer, no upsell wall. Open it and start writing.
            </p>
            <Link to={user ? "/home" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
      </main>
    </>
  );
}
