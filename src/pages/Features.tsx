import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Search, Tag, Timer, FileText, Share2, Lock, Layers, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShufflerCard, TypewriterCard, SchedulerCard } from "@/components/AnimatedFeatureCards";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

const groups = [
  {
    title: "Writing",
    items: [
      { Icon: FileText, name: "Markdown editor", desc: "Headings, tables, code blocks, and a refined toolbar built for long-form thinking." },
      { Icon: Wand2, name: "AI explanations", desc: "Highlight any phrase and ask for a streaming, source-aware explanation in a side panel." },
      { Icon: Layers, name: "Templates", desc: "Lectures, meetings, research — start with structure instead of a blank page." },
    ],
  },
  {
    title: "Organization",
    items: [
      { Icon: Tag, name: "Smart tags", desc: "A live tag cloud that aggregates across every notebook so nothing gets lost." },
      { Icon: Search, name: "Global search", desc: "Cross-notebook full-text search with ⌘K and clickable tag chips." },
      { Icon: Timer, name: "Study planner", desc: "Plan sessions, track streaks, and keep momentum with a built-in Pomodoro." },
    ],
  },
  {
    title: "Sharing & Trust",
    items: [
      { Icon: Share2, name: "Public share links", desc: "Publish read-only views with secure tokens — revoke any time." },
      { Icon: Lock, name: "Private by default", desc: "Row-level security, JWT auth, and private buckets with signed URLs." },
      { Icon: Sparkles, name: "Focus mode", desc: "A distraction-free canvas with the Pomodoro tucked in for deep work." },
    ],
  },
];

export default function FeaturesPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Features — Notebook Archive";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Every feature that makes Notebook Archive a calm, intelligent place to think — writing, organization, and trust.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader activePage="features" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Features
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              Everything you need. Nothing you don't.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A curated set of tools designed to help you write, organize, and revisit your ideas — with intelligence woven in only where it actually helps.
            </p>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* Showcase cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
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

      {/* Feature groups */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          {groups.map((group, gIdx) => (
            <div key={group.title} className={gIdx > 0 ? "mt-20" : ""}>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2 text-center"
              >
                {group.title}
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="h-px w-16 bg-primary mx-auto mb-10"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {group.items.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <item.Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-foreground mb-2">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
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
              Try the whole toolkit for free
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              No credit card. No trial timer. Just open it and write.
            </p>
            <Link to={user ? "/app" : "/auth"} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Open App" : "Start writing"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
