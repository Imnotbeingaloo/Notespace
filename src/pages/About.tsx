import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Heart, Zap, Shield, Lightbulb, Target, Layers } from "lucide-react";
import AnimatedDivider from "@/components/AnimatedDivider";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const values = [
  { icon: Heart, title: "User-First Design", description: "Every feature is designed around how people actually think and write. No bloat, no clutter — just clarity. We obsess over every interaction to make sure it feels natural." },
  { icon: Zap, title: "Speed & Simplicity", description: "Fast, distraction-free tools that get out of your way and let you focus on what matters: your ideas. Every millisecond of latency matters to us." },
  { icon: Shield, title: "Privacy & Security", description: "Your notes are yours. We use end-to-end encryption and strict data policies. We never sell your data, track your content, or share it with third parties." },
  { icon: Lightbulb, title: "AI That Assists, Not Replaces", description: "Our AI helps you understand, organize, and recall — but your thinking stays yours. We enhance your workflow, we don't automate your brain." },
];

const timeline = [
  { year: "2024 Q1", title: "The Idea", description: "Born from frustration with note apps that were either too simple or too complex. We wanted both power and elegance in a single tool — something that could grow with the user." },
  { year: "2024 Q3", title: "First Beta", description: "Launched with markdown editing, notebooks, and instant search. Early adopters loved the clean interface and immediately started requesting AI features." },
  { year: "2025 Q1", title: "AI Integration", description: "Added AI-powered explanations, smart tagging, and auto-summaries. Notes became intelligent — users reported 40% faster study sessions." },
  { year: "2025 Q3", title: "Teams & Collaboration", description: "Shared notebooks, real-time co-editing, and team knowledge bases for study groups and workplaces. Now used by 200+ teams worldwide." },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

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
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20">
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-20 max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-6">
            We're building the notebook <span className="text-primary">you always wanted</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Notebook Archive was created for thinkers — students, researchers, writers, and anyone who believes better tools lead to better ideas. We're a small, passionate team on a mission to make knowledge management feel effortless.
          </p>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We believe that the tools you use to think should be as smart as you are. Most note-taking apps treat your notes as static files — we treat them as living knowledge that can be searched, connected, and understood.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our goal is to build the most intelligent, beautiful, and privacy-respecting note-taking platform in the world. One that helps you not just store information, but truly learn from it.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Layers className="h-6 w-6 text-accent" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our Approach</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We don't chase features for the sake of features. Every capability in Notebook Archive exists because real users asked for it, and because we validated that it genuinely improves how people work.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We ship fast, listen carefully, and iterate constantly. Our beta users aren't just testers — they're co-designers who shape the product's direction.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-foreground/[0.03] py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our Philosophy</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We rethought what a note-taking app should be from the ground up. The difference is in how we treat your knowledge.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-border bg-card p-8">
              <p className="text-muted-foreground text-sm mb-2">Most note apps focus on:</p>
              <p className="font-serif text-xl font-bold text-foreground mb-3">Storing information</p>
              <p className="text-sm text-muted-foreground leading-relaxed">They give you a blank page and leave the rest to you. Your notes sit in folders, disconnected and forgotten.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-[2rem] border border-primary/30 bg-primary/5 p-8">
              <p className="text-muted-foreground text-sm mb-2">We focus on:</p>
              <p className="font-serif text-xl font-bold text-foreground mb-3">
                <span className="text-primary">Understanding</span> information
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">We use AI to explain concepts, connect ideas, and help you actually learn from what you write.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 py-28 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">What We Believe</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            These are the principles that guide every decision we make — from pixel-level design choices to how we handle your data.
          </p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-6 mt-10">
          {values.map((v) => (
            <motion.div key={v.title} variants={fadeUp} whileHover={{ y: -3, transition: { duration: 0.2 } }} className="flex gap-4 p-7 rounded-[2rem] border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="bg-foreground/[0.03] py-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From a late-night idea to a platform used by thousands — here's how we got here, and where we're headed next.
            </p>
          </motion.div>
          <div className="relative mt-12">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-4 top-0 bottom-0 w-px bg-border origin-top"
            />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="relative pl-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2, type: "spring", stiffness: 200 }}
                    className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background"
                  />
                  <span className="text-xs font-mono text-primary/70 font-semibold">{item.year}</span>
                  <h3 className="font-serif text-lg font-bold text-foreground mt-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-28">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-12 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Join us on the journey</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">We're just getting started. Be part of a community that thinks better, together.</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Free to use, open to feedback, and always improving based on what you need.</p>
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            {user ? "Open App" : "Get Started Free"} <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-serif text-sm font-bold text-foreground">Notebook Archive</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Notebook Archive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
