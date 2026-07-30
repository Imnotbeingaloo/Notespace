import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Zap, HelpCircle } from "lucide-react";
import AnimatedDivider from "@/components/AnimatedDivider";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { AnimatedHeading } from "@/components/AnimatedHeading";
import { SeoHead } from "@/components/SeoHead";
import { FurtherReading } from "@/components/FurtherReading";

const tiers = [
  {
    name: "Free",
    price: "$0",
    annual: "$0",
    audience: "For the person testing whether this replaces their current notebook.",
    description: "A complete starting point with room to capture, organize, and search your work.",
    features: [
      "Up to 3 notebooks",
      "Unlimited notes with markdown",
      "AI topic explanations (5/day)",
      "Instant ⌘K global search",
      "Smart auto-tagging",
      "Focus Mode & word-count goal",
      "Templates gallery",
      "Export to PDF & Markdown",
      "File attachments (50 MB)",
      "Offline write-queue & auto-sync",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    annual: "$15",
    period: "/month",
    audience: "For students and writers in their notes every single day.",
    description: "For daily users who require unlimited AI access and advanced workflow tools.",
    features: [
      "Unlimited notebooks",
      "Unlimited AI explanations",
      "AI summaries & flashcard generation",
      "Study Planner & Pomodoro tools",
      "Temporary (session-only) notes",
      "Share notes via public link",
      "File attachments (10 GB)",
      "PDF & document import with AI cleanup",
      "Voice transcription (coming soon)",
      "Priority support",
    ],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    annual: "$24",
    period: "/user/month",
    audience: "For study groups, labs, and small teams sharing one source of truth.",
    description: "Shared workspaces for study groups, labs, and teams collaborating on long-form work.",
    features: [
      "Everything in Pro",
      "Shared notebooks (coming soon)",
      "Real-time co-editing (coming soon)",
      "Team knowledge base",
      "Admin dashboard & permissions",
      "SSO & advanced security (on request)",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];


const comparisons: { feature: string; free: boolean | "soon"; pro: boolean | "soon"; team: boolean | "soon" }[] = [
  { feature: "AI-powered explanations", free: true, pro: true, team: true },
  { feature: "AI summaries & flashcards", free: false, pro: true, team: true },
  { feature: "Smart auto-tagging", free: true, pro: true, team: true },
  { feature: "Global ⌘K search", free: true, pro: true, team: true },
  { feature: "Focus Mode & word-count goal", free: true, pro: true, team: true },
  { feature: "Templates gallery", free: true, pro: true, team: true },
  { feature: "Export to PDF", free: true, pro: true, team: true },
  { feature: "Export to Markdown", free: true, pro: true, team: true },
  { feature: "Export to Notion", free: false, pro: "soon", team: "soon" },
  { feature: "PDF/document import with AI cleanup", free: false, pro: true, team: true },
  { feature: "Study Planner & Pomodoro", free: false, pro: true, team: true },
  { feature: "Share notes via public link", free: false, pro: true, team: true },
  { feature: "Offline write-queue & auto-sync", free: true, pro: true, team: true },
  { feature: "Voice transcription + AI cleanup", free: false, pro: "soon", team: "soon" },
  { feature: "Version history", free: false, pro: "soon", team: "soon" },
  { feature: "Shared notebooks", free: false, pro: false, team: "soon" },
  { feature: "Real-time co-editing", free: false, pro: false, team: "soon" },
  { feature: "API access", free: false, pro: false, team: "soon" },
  { feature: "Custom AI training on your notes", free: false, pro: false, team: "soon" },
];


const faqs = [
  { q: "Can I switch plans later?", a: "Yes. You can upgrade, downgrade, or cancel at any time. Mid-cycle upgrades are prorated, and there are no long-term commitments." },
  { q: "Is there a student discount?", a: "Yes - students who sign up with a .edu address receive 50% off Pro automatically. No application required." },
  { q: "What happens to my notes if I downgrade?", a: "Your notes remain yours. You retain access to everything you've written; you simply cannot create notebooks beyond the free limit until you upgrade." },
  { q: "How does the free trial work?", a: "Fourteen days of Pro access with no credit card required. When the trial ends, you may subscribe or revert to the Free plan - your work is preserved either way." },
  { q: "Are my notes used to train AI models?", a: "No. Your notes are never used for model training and are never sold. The AI only sees the specific passage you point it at, and only when you ask it to." },
  { q: "Can I get a refund?", a: "Yes. If Pro isn't right for you, email us within 30 days of a charge and we'll refund it in full - no questionnaire, no retention call." },
  { q: "Can I export everything and leave?", a: "Always. One click exports any note to Markdown or PDF, and your whole archive is portable. No proprietary format holds your work hostage." },
];

const guarantees = [
  "30-day refund, no questions",
  "Cancel in one click",
  "Export everything, any plan",
];


const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function PricingPage() {
  const { user } = useAuth();
  const [billing, setBilling] = React.useState<"monthly" | "annual">("monthly");


  return (
    <>
      <SeoHead
        title="Pricing - Notespace"
        description="Free, Pro ($19/mo), and Team ($29/mo) - pick the plan that matches how you think. Unlimited notes on every tier."
        path="/pricing"
        jsonLd={[
          ...tiers.map((t) => ({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `Notespace ${t.name}`,
            description: t.description,
            brand: { "@type": "Brand", name: "Notespace" },
            offers: {
              "@type": "Offer",
              price: t.price.replace(/[^0-9.]/g, "") || "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: "https://notebookarchive.lovable.app/pricing",
            },
          })),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <main className="min-h-screen bg-background">
        <PageHeader activePage="pricing" />

      <section className="relative overflow-hidden pt-28 pb-8 border-b border-border">
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
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Plans That Grow With You</span>
            </div>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] tracking-normal pb-2 max-w-4xl mx-auto">
              Plans that <span className="text-primary">grow</span> with you
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start on Free. Upgrade when you need more capacity. The editor, search, and auto-save are identical on every plan - nothing essential is gated.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-6 pb-28">
        {/* Billing toggle */}
        <div className="flex flex-col items-center gap-3 mt-12">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
            {(["monthly", "annual"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBilling(cycle)}
                aria-pressed={billing === cycle}
                className="relative rounded-full px-5 py-2 text-xs font-semibold capitalize transition-colors"
              >
                {billing === cycle && (
                  <motion.span
                    layoutId="billing-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className={`relative z-10 ${billing === cycle ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {cycle}
                </span>
              </button>
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Annual billing saves ~20%
          </p>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto mt-12 items-start">
          {tiers.map((tier) => {
            const shown = billing === "annual" ? tier.annual : tier.price;
            return (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 24 } }}
                className={`relative rounded-[2rem] border p-8 text-left flex flex-col transition-shadow duration-300 ${
                  tier.highlighted
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-1 ring-primary/20 md:-mt-4 md:pb-10"
                    : "border-border bg-card hover:shadow-lg hover:shadow-primary/5"
                }`}
              >
                {tier.highlighted && (
                  <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 h-6 w-28 -translate-x-1/2 rotate-[-2deg] rounded-[2px] bg-accent/25 border border-accent/30"
                  />
                )}
                {tier.highlighted && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground mb-4 w-fit">
                    <Zap className="h-3 w-3" /> Most Popular
                  </div>
                )}
                <h2 className="font-serif text-xl font-bold text-foreground">{tier.name}</h2>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{tier.audience}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <motion.span
                    key={shown}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-4xl font-bold text-foreground"
                  >
                    {shown}
                  </motion.span>
                  {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                </div>
                {billing === "annual" && tier.period && (
                  <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-accent">Billed yearly</p>
                )}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={user ? "/app" : "/auth"}
                  className={`magnetic-btn mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {tier.cta}
                </Link>
                {tier.highlighted && (
                  <p className="mt-3 text-center text-[11px] text-muted-foreground">No card required to start.</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Guarantees */}
        <div className="grid gap-4 sm:grid-cols-3 max-w-5xl mx-auto mt-12">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border bg-card/60 px-5 py-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="font-serif text-sm font-bold text-foreground">{g.title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{g.body}</p>
            </motion.div>
          ))}
        </div>
      </section>


      <AnimatedDivider />

      {/* Feature Comparison Table */}
      <section className="bg-foreground/[0.03] py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Compare plans</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A complete view of every plan. Upgrading only adds capabilities - nothing you had before is removed.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="rounded-[2rem] border border-border bg-card overflow-hidden mt-10">
            <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-0 text-sm min-w-[540px]">
              <div className="p-4 font-medium text-muted-foreground border-b border-border">Feature</div>
              <div className="p-4 font-semibold text-foreground text-center border-b border-border">Free</div>
              <div className="p-4 font-semibold text-primary text-center border-b border-border bg-primary/5">Pro</div>
              <div className="p-4 font-semibold text-foreground text-center border-b border-border">Team</div>
              {comparisons.map((row, i) => {
                const cell = (v: boolean | "soon") =>
                  v === "soon" ? (
                    <span className="inline-block rounded-full bg-accent/15 text-accent px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider">Soon</span>
                  ) : v ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  );
                return (
                  <React.Fragment key={i}>
                    <div className="p-4 text-foreground border-b border-border/50">{row.feature}</div>
                    <div className="p-4 text-center border-b border-border/50">{cell(row.free)}</div>
                    <div className="p-4 text-center border-b border-border/50 bg-primary/5">{cell(row.pro)}</div>
                    <div className="p-4 text-center border-b border-border/50">{cell(row.team)}</div>
                  </React.Fragment>
                );
              })}

            </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatedDivider />

      {/* FAQ */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Frequently asked questions</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Clear answers to the questions we hear most often.</p>
          </motion.div>
          <div className="space-y-6 mt-10">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-serif text-base font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatedDivider />

      <FurtherReading
        slugs={[
          "notion-alternatives-2026",
          "evernote-alternatives-2026",
          "obsidian-alternatives-2026",
        ]}
        heading="Comparing tools? Start here."
      />

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
              Choose your plan
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              The free plan is not a trial. You are welcome to use it indefinitely - upgrade only when you need more.
            </p>
            <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
              {user ? "Open App" : "Start on Free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
      </main>
    </>
  );
}
