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

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Great for students getting started with smarter note-taking. Everything you need to capture and organize your thoughts.",
    features: ["Up to 3 notebooks", "Unlimited notes with markdown", "AI topic explanations (5/day)", "Instant ⌘K search", "Auto-save & sync", "Export to PDF & Markdown", "File attachments (50 MB)", "Version history (7 days)"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users who need full AI capabilities, deeper insights, and unlimited everything.",
    features: ["Unlimited notebooks", "Unlimited AI explanations", "AI summaries & flashcard generation", "Smart auto-tagging & linking", "Voice-to-note transcription", "File attachments (10 GB)", "Version history (unlimited)", "Export to Notion & integrations", "Priority support"],
    cta: "Start 14-Day Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/user/month",
    description: "Collaborate on shared notebooks with your team, study group, or research lab.",
    features: ["Everything in Pro", "Shared notebooks & real-time co-editing", "Team knowledge base", "Admin dashboard & permissions", "SSO & advanced security", "Custom AI training on team data", "API access & webhooks", "Dedicated account manager"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const comparisons = [
  { feature: "AI-powered explanations", free: true, pro: true, team: true },
  { feature: "AI summaries & flashcards", free: false, pro: true, team: true },
  { feature: "Export (PDF & Markdown)", free: true, pro: true, team: true },
  { feature: "Export to Notion", free: false, pro: true, team: true },
  { feature: "Voice transcription", free: false, pro: true, team: true },
  { feature: "Smart auto-tagging", free: false, pro: true, team: true },
  { feature: "Version history", free: true, pro: true, team: true },
  { feature: "Shared notebooks", free: false, pro: false, team: true },
  { feature: "Real-time collaboration", free: false, pro: false, team: true },
  { feature: "API access", free: false, pro: false, team: true },
  { feature: "Custom AI training", free: false, pro: false, team: true },
];

const faqs = [
  { q: "Can I switch plans later?", a: "Absolutely. You can upgrade, downgrade, or cancel anytime. If you upgrade mid-cycle, we'll prorate the difference. No lock-in, no hidden fees." },
  { q: "Is there a student discount?", a: "Yes! Students with a valid .edu email get 50% off Pro. Just sign up with your university email and the discount applies automatically." },
  { q: "What happens to my notes if I downgrade?", a: "Your notes are always yours. If you downgrade from Pro to Free, you'll keep all your notes but won't be able to create new notebooks beyond the free limit." },
  { q: "How does the free trial work?", a: "The 14-day Pro trial gives you full access to all Pro features. No credit card required to start. At the end of the trial, you can subscribe or continue on the Free plan." },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <>
      <SeoHead
        title="Pricing — Notebook Archive"
        description="Free, Pro ($19/mo), and Team ($29/mo) — pick the plan that matches how you think. Unlimited notes on every tier."
        path="/pricing"
        jsonLd={tiers.map((t) => ({
          "@context": "https://schema.org",
          "@type": "Product",
          name: `Notebook Archive ${t.name}`,
          description: t.description,
          brand: { "@type": "Brand", name: "Notebook Archive" },
          offers: {
            "@type": "Offer",
            price: t.price.replace(/[^0-9.]/g, "") || "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://notebookarchive.lovable.app/pricing",
          },
        }))}
      />
      <main className="min-h-screen bg-background">
        <PageHeader activePage="pricing" />

      <section className="relative overflow-hidden pt-28 pb-8">
        <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Simple Pricing
            </div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
              Plans that grow with you
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start free, upgrade when you need more AI power. No hidden fees, cancel anytime. Every plan includes our core markdown editor, instant search, and auto-save — so you're always covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-6 pb-28">
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto mt-14">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`rounded-[2rem] border p-8 text-left flex flex-col transition-shadow duration-300 ${
                tier.highlighted
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card hover:shadow-lg hover:shadow-primary/5"
              }`}
            >
              {tier.highlighted && (
                <div className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground mb-4 w-fit">
                  <Zap className="h-3 w-3" /> Most Popular
                </div>
              )}
              <h3 className="font-serif text-xl font-bold text-foreground">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
              </div>
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
            </motion.div>
          ))}
        </motion.div>
      </section>

      <AnimatedDivider />

      {/* Feature Comparison Table */}
      <section className="bg-foreground/[0.03] py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Compare plans in detail</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">See exactly what's included in each plan. Every tier builds on the last, so you never lose features when you upgrade.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="rounded-[2rem] border border-border bg-card overflow-hidden mt-10">
            <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-0 text-sm min-w-[540px]">
              <div className="p-4 font-medium text-muted-foreground border-b border-border">Feature</div>
              <div className="p-4 font-semibold text-foreground text-center border-b border-border">Free</div>
              <div className="p-4 font-semibold text-primary text-center border-b border-border bg-primary/5">Pro</div>
              <div className="p-4 font-semibold text-foreground text-center border-b border-border">Team</div>
              {comparisons.map((row, i) => (
                <React.Fragment key={i}>
                  <div className="p-4 text-foreground border-b border-border/50">{row.feature}</div>
                  <div className="p-4 text-center border-b border-border/50">
                    {row.free ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="p-4 text-center border-b border-border/50 bg-primary/5">
                    {row.pro ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="p-4 text-center border-b border-border/50">
                    {row.team ? <Check className="h-4 w-4 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>}
                  </div>
                </React.Fragment>
              ))}
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
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Quick answers to common questions about our plans, billing, and features.</p>
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

      {/* CTA */}
      <section className="container mx-auto px-6 pb-28">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-12 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to think better?</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">Start capturing, organizing, and understanding your knowledge today.</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">Start with the free plan — no credit card required. Upgrade whenever you're ready.</p>
          <Link to={user ? "/app" : "/auth"} className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25">
            {user ? "Open App" : "Get Started Free"} <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
