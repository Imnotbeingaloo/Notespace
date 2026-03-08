import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Shield, Lightbulb, Target, Layers, ArrowRight, BookOpen, Eye } from "lucide-react";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader activePage="about" />

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

      <AnimatedDivider />

      {/* Mission & Approach — Zigzag */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full bg-border origin-top"
              />
            </div>

            <div className="flex flex-col gap-20">
              {/* Mission — left */}
              <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-[2rem] border border-border bg-card p-8 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_circle_at_50%_50%,hsl(var(--primary)/0.06),transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">We believe that the tools you use to think should be as smart as you are. Most note-taking apps treat your notes as static files — we treat them as living knowledge.</p>
                    <p className="text-muted-foreground leading-relaxed">Our goal is to build the most intelligent, beautiful, and privacy-respecting note-taking platform in the world.</p>
                  </div>
                </motion.div>
                <div className="hidden md:flex items-center justify-start relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="absolute left-1/2 -translate-x-[calc(50%+50%)] w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/25"
                    style={{ left: 0, transform: "translateX(-200%)" }}
                  />
                </div>
              </div>

              {/* Approach — right */}
              <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                <div className="hidden md:block" />
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-[2rem] border border-border bg-card p-8 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(600px_circle_at_50%_50%,hsl(var(--accent)/0.06),transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                      <Layers className="h-6 w-6 text-accent" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Our Approach</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">We don't chase features for the sake of features. Every capability exists because real users asked for it.</p>
                    <p className="text-muted-foreground leading-relaxed">We ship fast, listen carefully, and iterate constantly. Our beta users aren't just testers — they're co-designers.</p>
                  </div>
                </motion.div>
              </div>
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
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">What We Believe</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">These are the principles that guide every decision we make.</p>
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
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">From a late-night idea to a platform used by thousands.</p>
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
      <section className="container mx-auto px-6 py-28">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-12 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Join us on the journey</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">We're just getting started. Be part of a community that thinks better, together.</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Free to use, open to feedback, and always improving.</p>
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            {user ? "Open App" : "Get Started Free"} <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
