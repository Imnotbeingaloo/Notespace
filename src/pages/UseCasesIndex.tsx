import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, PenLine, Microscope } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { SeoHead } from "@/components/SeoHead";

const cases = [
  {
    to: "/use-cases/students",
    Icon: GraduationCap,
    title: "For students",
    blurb: "Organize lectures by course, summarize PDFs, and prepare for exams without losing a week to setup.",
  },
  {
    to: "/use-cases/writers",
    Icon: PenLine,
    title: "For writers",
    blurb: "Draft long-form work in a quiet editor with focus mode, structure, and a writing streak that rewards consistency.",
  },
  {
    to: "/use-cases/researchers",
    Icon: Microscope,
    title: "For researchers",
    blurb: "Annotate papers, pull quotes from PDFs, and search across every notebook in one place.",
  },
];

export default function UseCasesIndex() {
  return (
    <>
      <SeoHead
        title="Use Cases — Notebook Archive"
        description="Notebook Archive for students, writers, and researchers. See how a calm, AI-assisted note-taking app fits each workflow."
        path="/use-cases"
      />
      <main className="min-h-screen bg-background">
        <PageHeader />
        <section className="relative overflow-hidden pt-28 pb-16 border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04] pointer-events-none" />
          <div className="container mx-auto px-6 pt-8 pb-12 md:pt-16 md:pb-20 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-8 bg-accent" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">Use cases</span>
              </div>
              <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3.1rem] font-bold text-foreground leading-[1.18] max-w-4xl mx-auto">
                Built for the way <span className="text-primary">you actually work</span>.
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Notebook Archive adapts to your discipline. Pick the workflow closest to yours.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-5xl grid gap-6 md:grid-cols-3">
            {cases.map(({ to, Icon, title, blurb }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <Icon className="h-7 w-7 text-primary mb-4" />
                <h2 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{blurb}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
