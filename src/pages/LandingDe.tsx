import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  NotebookPen,
  Sparkles,
  Search,
  Lock,
  FileText,
  Brain,
  Target,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const CTA =
  "/auth?ref=de-landing&utm_source=organic&utm_medium=landing&utm_campaign=de-homepage";

const features = [
  {
    icon: NotebookPen,
    title: "Schreiben, das sich gut anfühlt",
    body: "Sauberer Markdown-Editor mit Serifenschrift, Fokus-Modus und täglichem Wortziel. Gemacht für Menschen, die wirklich schreiben — nicht für die, die nur Workspaces einrichten.",
  },
  {
    icon: Brain,
    title: "KI, die erklärt — nicht ersetzt",
    body: "Markiere einen Begriff und lass dir das Konzept erklären. Lade ein PDF hoch und bekomme eine ehrliche Zusammenfassung. Deine Worte bleiben deine Worte.",
  },
  {
    icon: Search,
    title: "Globale Suche & smarte Tags",
    body: "Finde jede Notiz aus jedem Notizbuch mit ⌘K. Tags werden automatisch aggregiert — du musst nichts manuell sortieren.",
  },
  {
    icon: FileText,
    title: "PDF-Text-Extraktion",
    body: "Lade Skripte, Paper oder Bücher hoch. Der Text wird mit erkannten Überschriften und sauberer Formatierung extrahiert — bereit zum Lernen.",
  },
  {
    icon: Target,
    title: "Tägliches Wortziel",
    body: "Setze ein realistisches Ziel und sieh deine Wochenstatistik. Kleine Streaks, die echte Gewohnheiten formen.",
  },
  {
    icon: Lock,
    title: "Privat by default",
    body: "Verschlüsselte Speicherung, private Buckets, strikte Zugriffsregeln. Deine Notizen werden niemals zum KI-Training verwendet.",
  },
];

const faq = [
  {
    q: "Was ist Notebook Archive?",
    a: "Notebook Archive ist eine KI-Notizen-App für Menschen, die täglich schreiben — Studierende, Autoren und Forschende. Statt Funktionen aneinanderzureihen, fokussieren wir uns auf einen sauberen Editor, ehrliche KI-Erklärungen und ein Notizbuch-System, das mit dir wächst.",
  },
  {
    q: "Funktioniert die App vollständig auf Deutsch?",
    a: "Die Oberfläche der App selbst ist aktuell auf Englisch, aber Editor, KI-Erklärungen und PDF-Extraktion arbeiten problemlos auf Deutsch. Eine vollständige deutsche Übersetzung der UI ist auf der Roadmap.",
  },
  {
    q: "Was kostet Notebook Archive?",
    a: "Es gibt einen kostenlosen Tarif, der für den echten Alltag reicht. Pro kostet 19 $ pro Monat und entsperrt mehr Notizbücher, mehr KI-Nutzung und größere Datei-Uploads. Es gibt keine versteckten Gebühren und keine Werbung.",
  },
  {
    q: "Werden meine Notizen zum KI-Training verwendet?",
    a: "Nein. Niemals. Deine Notizen sind privat und gehören dir. KI-Anfragen werden anonymisiert an unsere Modellanbieter gesendet und nicht für Training gespeichert.",
  },
  {
    q: "Kann ich meine Notizen exportieren?",
    a: "Ja. Alles lässt sich als Markdown exportieren — eine offene, lesbare Datei, die in jedem Editor funktioniert. Keine Vendor-Lock-in.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    inLanguage: "de",
    name: "Notebook Archive",
    applicationCategory: "Productivity",
    operatingSystem: "Web",
    description:
      "Notebook Archive ist eine KI-Notizen-App für Studierende, Autoren und Forschende — mit Markdown-Editor, PDF-Extraktion und ehrlichen KI-Erklärungen.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    url: "https://notebookarchive.lovable.app/de",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "de",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function LandingDe() {
  const { user } = useAuth();

  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = "de";
    return () => {
      document.documentElement.lang = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title="KI-Notizen-App für Studierende & Autoren — Notebook Archive"
        description="Notebook Archive ist die KI-Notizen-App für Menschen, die wirklich schreiben. Markdown-Editor, PDF-Extraktion, ehrliche KI — privat und werbefrei."
        canonical="/de"
        ogType="website"
        jsonLd={jsonLd}
      />

      <PageHeader />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-20 border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">
              Für deutschsprachige Schreibende
            </span>
            <span className="h-px w-10 bg-accent" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight"
          >
            Die <span className="text-primary">KI-Notizen-App</span> für Menschen, die
            wirklich schreiben.
          </motion.h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Notebook Archive verbindet einen sauberen Markdown-Editor mit ehrlicher KI,
            globaler Suche und einem Notizbuch-System, das mit dir wächst. Gebaut für
            Studierende, Autoren und Forschende — nicht für Workspace-Bastler.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={user ? "/app" : CTA}
              className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm md:text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/features"
              className="magnetic-btn inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-7 py-3 text-sm md:text-base font-semibold hover:bg-muted transition-colors"
            >
              Funktionen ansehen
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Keine Kreditkarte nötig · Werbefrei · Markdown-Export jederzeit
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">
                Was du bekommst
              </span>
              <span className="h-px w-10 bg-accent" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Sechs Dinge, die wir richtig machen.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <f.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-serif text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-24 border-b border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">
                Faire Preise
              </span>
              <span className="h-px w-10 bg-accent" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              Kostenlos starten. Upgrade nur, wenn du es willst.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="font-serif text-xl font-bold mb-1">Kostenlos</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-base font-normal text-muted-foreground"> / Monat</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["3 Notizbücher", "Unbegrenzte Notizen", "Markdown-Editor", "Basis-KI-Erklärungen", "Markdown-Export"].map((x) => (
                  <li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-card p-8 relative">
              <span className="absolute -top-3 left-8 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Beliebt</span>
              <h3 className="font-serif text-xl font-bold mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">$19<span className="text-base font-normal text-muted-foreground"> / Monat</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Unbegrenzte Notizbücher", "Großzügige KI-Nutzung", "PDF & Video-Uploads bis 1 GB", "Globale Suche & Smart Tags", "Fokus-Modus & Wortziel", "Priorisierter Support"].map((x) => (
                  <li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link to="/pricing" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Vollständige Preisübersicht <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-10 bg-accent" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-accent">
                Häufige Fragen
              </span>
              <span className="h-px w-10 bg-accent" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Ehrliche Antworten.</h2>
          </div>
          <div className="space-y-5">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-serif text-lg font-semibold list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Bereit, anders zu schreiben?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Starte kostenlos. Keine Kreditkarte, keine Werbung — nur ein Editor, der dich
            beim Denken in Ruhe lässt.
          </p>
          <Link
            to={user ? "/app" : CTA}
            className="magnetic-btn inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25"
          >
            Jetzt kostenlos starten <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
