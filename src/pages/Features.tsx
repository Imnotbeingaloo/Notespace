import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Tag, Timer, FileText, Share2, Lock, Layers, Wand2, BookOpen, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ShufflerCard, TypewriterCard, SchedulerCard } from "@/components/AnimatedFeatureCards";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";

const groups = [
  {
    title: "Writing",
    kicker: "The canvas",
    blurb:
      "Long-form writing should feel like thinking out loud. The editor stays out of your way until you need it — and then every tool is one keystroke away.",
    items: [
      { Icon: FileText, name: "Markdown editor", desc: "Headings, tables, code blocks, callouts, and a refined toolbar built for long-form thinking. Real-time word, character, and reading-time counts.", deepLink: "/app", linkLabel: "Open the editor" },
      { Icon: Wand2, name: "AI explanations", desc: "Highlight any phrase, click Explain, and watch a streaming, source-aware answer unfold in a side panel — without ever leaving your note.", deepLink: "/app", linkLabel: "Try it in a note" },
      { Icon: Layers, name: "Templates", desc: "Start lectures, meetings, weekly reviews, or research notes from a refined skeleton instead of an empty page.", deepLink: "/app", linkLabel: "Pick a template" },
    ],
  },
  {
    title: "Organization",
    kicker: "The system",
    blurb:
      "Notes are only useful if you can find them again. Tags aggregate across every notebook, sessions are planned, and a Pomodoro keeps you honest about deep work.",
    items: [
      { Icon: Tag, name: "Smart tags", desc: "Inline `#tags` aggregate into a live cloud in the sidebar — click any chip to jump straight to every note that mentions it.", deepLink: "/app", linkLabel: "See your tag cloud" },
      { Icon: Timer, name: "Pomodoro timer", desc: "A quiet 25/5 timer that lives in the corner of your workspace. Start a focused sprint, take a real break, and watch your sessions stack up.", deepLink: "/app", linkLabel: "Start a sprint" },
      { Icon: BookOpen, name: "Study planner", desc: "Plan sessions per notebook, track day streaks, and get gentle reminders so revision actually happens.", deepLink: "/app", linkLabel: "Open the planner" },
    ],
  },
  {
    title: "Sharing & Trust",
    kicker: "The foundation",
    blurb:
      "Your notes are yours. Everything is private by default, hardened against prompt injection, and only leaves your account when you explicitly share or export it.",
    items: [
      { Icon: Share2, name: "Public share links", desc: "Publish a read-only view via a secure token. Recipients see a polished public page — and you can revoke access in one click.", deepLink: "/app", linkLabel: "Share a note" },
      { Icon: Lock, name: "Private by default", desc: "JWT auth, signed-URL file storage, and strict row-level security mean nobody but you reads your notes — not even our AI without consent.", deepLink: "/pricing", linkLabel: "See the security model" },
      { Icon: Download, name: "Export anywhere", desc: "Take your work with you any time. One-click export to Markdown or PDF — no lock-in, no proprietary formats, ever.", deepLink: "/app", linkLabel: "Export a note" },
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
    <>
      <SeoHead
        title="Features — Notebook Archive"
        description="Markdown editor, AI explanations, focus mode, study planner, smart tags, find & replace, and frictionless sharing — every feature explained."
        path="/features"
      />
      <main className="min-h-screen bg-background">
        <PageHeader activePage="features" />

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Features
            </div>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-4xl mx-auto">
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

      {/* Feature groups — editorial zigzag */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl space-y-24 md:space-y-32">
          {groups.map((group, gIdx) => {
            const reverse = gIdx % 2 === 1;
            return (
              <div key={group.title} className="relative">
                <div className={`grid gap-10 md:gap-14 lg:gap-20 md:grid-cols-12 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                  {/* Left column — narrative */}
                  <motion.div
                    initial={{ opacity: 0, x: reverse ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-5"
                  >
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-primary">
                        {String(gIdx + 1).padStart(2, "0")} · {group.kicker}
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-5 leading-[1.1]">
                      {group.title}
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed mb-7">
                      {group.blurb}
                    </p>
                  </motion.div>

                  {/* Right column — feature list (vertical, no plain card grid) */}
                  <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } } }}
                    className="md:col-span-7 relative"
                  >
                    <ul className="relative space-y-5">
                      {/* Connector line — sits behind icons, capped to the icon column width */}
                      <div
                        aria-hidden
                        className="absolute left-[27px] top-6 bottom-6 w-[2px] rounded-full bg-border/70 hidden sm:block"
                        style={{ zIndex: 0 }}
                      />
                      {group.items.map((item, iIdx) => (
                        <motion.li
                          key={item.name}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                          }}
                          className="group relative flex gap-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-500 p-5 hover:shadow-lg hover:shadow-primary/5"
                          style={{ zIndex: 1 }}
                        >
                          <div className="relative shrink-0">
                            <motion.div
                              initial={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", scale: 0.85 }}
                              whileInView={{
                                backgroundColor: "hsl(var(--primary))",
                                color: "hsl(var(--primary-foreground))",
                                scale: 1,
                              }}
                              viewport={{ once: true, margin: "-40px" }}
                              transition={{ duration: 0.7, delay: 0.25 + iIdx * 0.15, ease: [0.16, 1, 0.3, 1] }}
                              className="w-12 h-12 rounded-xl flex items-center justify-center ring-4 ring-background shadow-md shadow-primary/10"
                            >
                              <item.Icon className="h-5 w-5" />
                            </motion.div>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-serif text-lg font-bold text-foreground mb-1.5 leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                            {item.deepLink && (
                              <Link
                                to={user ? item.deepLink : "/auth"}
                                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
                              >
                                {item.linkLabel}
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            );
          })}
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
      </main>
    </>
  );
}
