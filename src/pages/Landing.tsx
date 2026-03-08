import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShufflerCard, TypewriterCard, SchedulerCard } from "@/components/AnimatedFeatureCards";
import AnimatedDivider from "@/components/AnimatedDivider";

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

/** Reusable gradient separator — kept as fallback */
function SectionDivider() {
  return <AnimatedDivider />;
}

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (visibleLines >= editorLines.length) return;
    const currentLine = editorLines[visibleLines];
    if (currentLine.text === "") {
      const timeout = setTimeout(() => { setVisibleLines((v) => v + 1); setTypingText(""); setCurrentCharIndex(0); }, 300);
      return () => clearTimeout(timeout);
    }
    if (currentCharIndex < currentLine.text.length) {
      const timeout = setTimeout(() => { setTypingText(currentLine.text.slice(0, currentCharIndex + 1)); setCurrentCharIndex((c) => c + 1); }, 25 + Math.random() * 20);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => { setVisibleLines((v) => v + 1); setTypingText(""); setCurrentCharIndex(0); }, 400);
      return () => clearTimeout(timeout);
    }
  }, [visibleLines, currentCharIndex]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Floating Navbar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl transition-all duration-500 rounded-2xl ${
          scrolled ? "border border-border bg-background/70 backdrop-blur-xl shadow-lg shadow-primary/5" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-bold text-foreground">Notebook Archive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.isAnchor ? (
                <a key={link.label} href={link.href} className="px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200">{link.label}</a>
              ) : (
                <Link key={link.label} to={link.href} className="px-3 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200">{link.label}</Link>
              )
            )}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="magnetic-btn inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20">
                Open App <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Sign In</Link>
                <Link to="/auth" className="magnetic-btn inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border/50 overflow-hidden">
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI-Powered Note Taking
            </div>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              Your thoughts,{" "}<span className="text-primary">organized</span> &{" "}<span className="text-accent">understood</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Notebook Archive is the intelligent note-taking app that helps you capture ideas, organize knowledge, and get AI-powered insights — all in one beautiful workspace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                {user ? "Open App" : "Start for Free"} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="magnetic-btn inline-flex items-center gap-2 rounded-2xl border border-border px-8 py-3.5 text-base font-medium text-foreground hover:bg-muted transition-colors">
                See Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section className="container mx-auto px-6 mb-4">
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
                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={line.className}>
                    {line.text || "\u00A0"}
                  </motion.p>
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
      </section>

      <SectionDivider />

      {/* ── Features ── */}
      <section id="features" className="container mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to take{" "}<span className="text-primary">better notes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Powerful features that make Notebook Archive the perfect companion for students, researchers, and thinkers.
          </p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <ShufflerCard />
          <TypewriterCard />
          <SchedulerCard />
        </div>
      </section>


      {/* ── Separator ── */}
      <div className="py-2"><SectionDivider /></div>

      {/* ── Testimonials ── */}
      <section className="container mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Trusted by <span className="text-accent">professionals</span> and students
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            See why researchers, students, and teams choose Notebook Archive over traditional note-taking tools.
          </p>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            { quote: "Finally a note app that actually helps me understand what I'm writing, not just store it. The AI explanations are genuinely useful.", name: "Sarah K.", role: "PhD Researcher", emoji: "🔬" },
            { quote: "The AI explanations saved me during finals. It's like having a tutor built into my notebook. I can't go back to plain editors.", name: "Marcus L.", role: "Computer Science Student", emoji: "🎓" },
            { quote: "Our team switched from Notion and haven't looked back. The instant search and shared notebooks changed how we collaborate.", name: "Priya T.", role: "Product Manager", emoji: "💼" },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, type: "spring", stiffness: 150 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-[2rem] border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
            >
              <span className="text-2xl mb-3 block">{t.emoji}</span>
              <p className="text-sm text-foreground leading-relaxed mb-4 italic">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Separator ── */}
      <div className="py-2"><SectionDivider /></div>

      {/* ── CTA ── */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-12 md:p-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to organize your thinking?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join Notebook Archive and start capturing your ideas with the power of AI.
          </p>
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            {user ? "Open App" : "Get Started — It's Free"} <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card/50 rounded-t-[3rem]">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 md:grid-cols-4 mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-serif text-xl font-bold text-foreground">Notebook Archive</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                The intelligent note-taking app that helps you capture, organize, and truly understand your ideas.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">All Systems Operational</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Features</a></li>
                <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Pricing</Link></li>
                <li><Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">How It Works</Link></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">About</Link></li>
                <li><a href="mailto:support@notebookarchive.com" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Contact</a></li>
                <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer">Privacy Policy</span></li>
                <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer">Terms of Service</span></li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Get Started</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Start organizing your thoughts today — it's completely free.
              </p>
              <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300">
                {user ? "Open App" : "Sign Up Free"} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Notebook Archive. All rights reserved.</p>
              <p className="text-xs text-muted-foreground">Built with ❤️ for thinkers everywhere</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
