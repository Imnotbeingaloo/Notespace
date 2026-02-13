import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with note-taking.",
    features: ["Up to 3 notebooks", "Unlimited notes", "Markdown preview", "Instant search", "Auto-save"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For power users who need AI insights and more storage.",
    features: ["Unlimited notebooks", "AI-powered explanations", "File attachments (10 GB)", "Version history", "Priority support"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$19",
    period: "/user/month",
    description: "Collaborate with your team on shared notebooks.",
    features: ["Everything in Pro", "Shared notebooks", "Team management", "Admin dashboard", "SSO & advanced security"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
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
            <Link to="/pricing" className="text-sm font-medium text-foreground transition-colors">Pricing</Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          </nav>
          <Link to={user ? "/app" : "/auth"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            {user ? "Open App" : "Get Started"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Choose the plan that fits your workflow. Upgrade or downgrade anytime.</p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mt-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl border p-8 text-left flex flex-col ${
                tier.highlighted
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <h3 className="font-serif text-xl font-bold text-foreground">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={user ? "/app" : "/auth"}
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity ${
                  tier.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
