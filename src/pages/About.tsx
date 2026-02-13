import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Heart, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const values = [
  { icon: Heart, title: "User-First Design", description: "Every feature is designed around how people actually think and write." },
  { icon: Zap, title: "Speed & Simplicity", description: "Fast, distraction-free tools that get out of your way and let you focus." },
  { icon: Shield, title: "Privacy & Security", description: "Your notes are yours. End-to-end encryption and strict data policies." },
];

export default function AboutPage() {
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
            <Link to="/about" className="text-sm font-medium text-foreground transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          </nav>
          <Link to={user ? "/app" : "/auth"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-20 pb-24 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">About Notebook Archive</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Notebook Archive was built for people who think deeply — students, researchers, writers, and lifelong learners who need a place to organize their thoughts and get more out of their notes.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-16">
            We believe note-taking should be simple, beautiful, and intelligent. With AI-powered explanations, markdown support, and a clean interface, Notebook Archive helps you capture and understand knowledge faster.
          </p>
        </motion.div>

        <h2 className="font-serif text-2xl font-bold text-foreground mb-8">Our Values</h2>
        <div className="space-y-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-4 p-6 rounded-xl border border-border bg-card"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
