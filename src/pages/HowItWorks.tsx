import { motion } from "framer-motion";
import { BookOpen, ArrowRight, PenLine, FolderOpen, Sparkles, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const steps = [
  { icon: FolderOpen, title: "1. Create a Notebook", description: "Organize your notes by topic, class, or project. Each notebook holds all related notes in one place." },
  { icon: PenLine, title: "2. Write in Markdown", description: "Use the clean, distraction-free editor with full markdown support. Preview your formatted notes instantly." },
  { icon: Sparkles, title: "3. Get AI Insights", description: "Select any topic and get AI-powered explanations to deepen your understanding of complex subjects." },
  { icon: Search, title: "4. Find Anything Fast", description: "Use ⌘K search to instantly find notes across all your notebooks. Never lose a thought again." },
];

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
          <Link to={user ? "/app" : "/auth"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-20 pb-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h1>
          <p className="text-lg text-muted-foreground mb-16">Get started in minutes. Here's how Notebook Archive helps you think better.</p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="flex gap-5 p-6 rounded-xl border border-border bg-card"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Link
            to={user ? "/app" : "/auth"}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
