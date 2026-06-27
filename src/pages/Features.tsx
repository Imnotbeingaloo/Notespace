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
      "Writing should feel close to thinking. The editor stays quiet by default, and the tools you actually use sit one keystroke away when you reach for them.",
    items: [
      { Icon: FileText, name: "Markdown editor", desc: "Headings, tables, code blocks, callouts, and a toolbar built around long pages, not landing copy. Word count, character count, and read time tick in the footer as you type.", deepLink: "/app", linkLabel: "Open the editor" },
      { Icon: Wand2, name: "AI explanations", desc: "Highlight a phrase, hit Explain, and the answer streams in beside your note. You stay on the page; the model does the reading.", deepLink: "/app", linkLabel: "Try it in a note" },
      { Icon: Layers, name: "Templates", desc: "Skip the blank page. Lectures, meetings, weekly reviews, research starts — pick a scaffold and start filling it in.", deepLink: "/app", linkLabel: "Pick a template" },
    ],
  },
  {
    title: "Organization",
    kicker: "The system",
    blurb:
      "Notes only matter if you can find them again. Tags collect themselves across notebooks, sessions get planned, and a Pomodoro keeps you honest about the part where you actually sit and work.",
    items: [
      { Icon: Tag, name: "Smart tags", desc: "Type `#anything` inside a note. It shows up in the sidebar cloud; click the chip later to pull every note that mentions it.", deepLink: "/app", linkLabel: "See your tag cloud" },
      { Icon: Timer, name: "Pomodoro timer", desc: "A small 25/5 timer parked in the corner. Start a sprint, take a real break, and watch your completed sessions stack up over the day.", deepLink: "/app", linkLabel: "Start a sprint" },
      { Icon: BookOpen, name: "Study planner", desc: "Schedule sessions per notebook, watch your day streak, and get a nudge when you're about to skip one.", deepLink: "/app", linkLabel: "Open the planner" },
    ],
  },
  {
    title: "Sharing & Trust",
    kicker: "The foundation",
    blurb:
      "Your notes belong to you. Everything is private unless you decide otherwise, the AI never reads anything without your say-so, and you can leave with your data any time.",
    items: [
      { Icon: Share2, name: "Public share links", desc: "Generate a read-only link with a secure token. The recipient gets a clean public page; you can revoke it with one click.", deepLink: "/app", linkLabel: "Share a note" },
      { Icon: Lock, name: "Private by default", desc: "JWT auth, signed file URLs, and row-level security in the database. Nobody else sees your notes — including us, including the AI, until you ask.", deepLink: "/pricing", linkLabel: "See the security model" },
      { Icon: Download, name: "Export anywhere", desc: "Markdown or PDF, one click, no proprietary wrappers. Your work walks out the same way it walked in.", deepLink: "/app", linkLabel: "Export a note" },
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
      <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Features</span>
            </div>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-4xl mx-auto">
              What's in the box, and <span className="text-primary">nothing</span> that isn't.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A small, deliberate toolkit for writing, organizing, and pulling ideas back up later. The AI shows up where it earns its keep, not where it can.
            </p>
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
                    viewport={{ once: false, amount: 0.2, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="md:col-span-5"
                  >
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-accent">
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
                    viewport={{ once: false, amount: 0.15, margin: "-60px" }}
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
                              viewport={{ once: false, amount: 0.3, margin: "-40px" }}
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
              Take the whole kit for a spin
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              No card. No countdown. Just open it and write something.
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
