import { motion } from "framer-motion";
import { BookOpen, Sparkles, Search, Paperclip, FileText, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: FileText,
    title: "Organized Notebooks",
    description: "Create multiple notebooks to categorize your notes by topic, project, or subject.",
  },
  {
    icon: Eye,
    title: "Markdown Preview",
    description: "Write in markdown and instantly preview rendered output with full GFM support.",
  },
  {
    icon: Sparkles,
    title: "AI Explanations",
    description: "Get AI-powered explanations of your notes' topics to deepen your understanding.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Find any note across all notebooks with lightning-fast ⌘K search.",
  },
  {
    icon: Paperclip,
    title: "File Attachments",
    description: "Attach images, documents, and files directly to your notes for easy reference.",
  },
  {
    icon: BookOpen,
    title: "Auto-Save",
    description: "Never lose your work — notes are saved automatically as you type.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">Notebook Archive</span>
          </Link>

          {/* Nav links - hidden on mobile, shown on md+ */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
              >
                Open App
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI-Powered Note Taking
            </div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              Your thoughts,{" "}
              <span className="text-primary">organized</span> &{" "}
              <span className="text-accent">understood</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Notebook Archive is the intelligent note-taking app that helps you capture ideas, organize knowledge, and get AI-powered insights — all in one beautiful workspace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={user ? "/app" : "/auth"}
                className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
              >
                {user ? "Open App" : "Start for Free"}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="magnetic-btn inline-flex items-center gap-2 rounded-2xl border border-border px-8 py-3.5 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                See Features
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Preview */}
      <section className="container mx-auto px-6 -mt-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">Notebook Archive</span>
          </div>
          <div className="flex min-h-[400px]">
            {/* Mock sidebar */}
            <div className="w-56 border-r border-border bg-sidebar p-3 hidden md:block">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-serif text-sm font-bold text-foreground">Notebook Archive</span>
              </div>
              <div className="space-y-1">
                {["📓 Physics Notes", "📗 Biology Lab", "📘 History Essay"].map((item, i) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg text-xs ${i === 0 ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Mock editor */}
            <div className="flex-1 p-6">
              <h2 className="font-serif text-xl font-bold text-foreground mb-1">Quantum Mechanics Intro</h2>
              <p className="text-xs text-muted-foreground mb-4">Updated Jan 15, 2:30 PM</p>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p className="text-foreground font-medium">## Wave-Particle Duality</p>
                <p>Light and matter exhibit properties of both waves and particles. This fundamental concept was demonstrated by the **double-slit experiment**.</p>
                <p className="text-foreground font-medium">### Key Equations</p>
                <p>- Energy: `E = hf`</p>
                <p>- De Broglie wavelength: `λ = h/p`</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to take{" "}
            <span className="text-primary">better notes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Powerful features that make Notebook Archive the perfect companion for students, researchers, and thinkers.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="rounded-[2rem] border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-12 md:p-16 text-center max-w-4xl mx-auto"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to organize your thinking?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Join Notebook Archive and start capturing your ideas with the power of AI.
          </p>
          <Link
            to={user ? "/app" : "/auth"}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            {user ? "Open App" : "Get Started — It's Free"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-bold text-foreground">Notebook Archive</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Notebook Archive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
