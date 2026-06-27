import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, NotebookPen, Layers, Brain, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import Footer from "@/components/Footer";

const CTA = "/auth?ref=blog-de&utm_source=blog&utm_medium=organic&utm_campaign=ki-notizen-app";

const picks = [
  {
    name: "Notebook Archive",
    tagline: "Die KI-Notizen-App für Menschen, die wirklich schreiben.",
    why: "Sauberer Markdown-Editor mit Serifenschrift, Fokus-Modus, tägliches Wortziel und KI, die Konzepte erklärt und Quellen zusammenfasst — ohne deinen Text neu zu schreiben. Notizbücher lassen sich verschachteln, Tags sind global, und alles lässt sich als Markdown exportieren.",
    pricing: "Kostenlos; Pro 19 $/Monat",
    bestFor: "Autoren, Studierende und Forschende, die jeden Tag schreiben.",
    disclosure: "Hinweis: Das ist unser eigenes Produkt. Bewertungskriterien siehe unten.",
    icon: NotebookPen,
  },
  {
    name: "Notion",
    tagline: "Wiki, Datenbank und Notizen-App in einem.",
    why: "Mächtig, aber überladen. Viele Nutzer richten ihren Workspace mehr ein, als sie ihn nutzen. KI ist ein 10 $/Monat-Add-on.",
    pricing: "Kostenlos; KI-Add-on 10 $/Monat",
    bestFor: "Teams und Menschen, die gerne Systeme bauen.",
    icon: Layers,
  },
  {
    name: "Obsidian",
    tagline: "Lokale Markdown-Dateien mit Backlinks und Graph-Ansicht.",
    why: "Deine Notizen leben als Dateien auf deinem Gerät. Steile Lernkurve, aber unschlagbar, wenn du langfristig Wissen sammeln willst. KI nur über Plugins (eigener API-Key).",
    pricing: "Kostenlos; Sync 5 $/Monat",
    bestFor: "Menschen, die volle Kontrolle und Datenschutz wollen.",
    icon: Brain,
  },
  {
    name: "Mem",
    tagline: "Die App, die sich selbst sortiert.",
    why: "Auto-Tagging und ähnliche-Notizen-Vorschläge. Gut, wenn du Ordner hasst — schlecht, wenn du Struktur brauchst.",
    pricing: "Kostenlos; Mem X 14,99 $/Monat",
    bestFor: "Menschen, die einfach drauflosschreiben wollen.",
    icon: Sparkles,
  },
];

const faq = [
  {
    q: "Was ist die beste KI-Notizen-App im Jahr 2026?",
    a: "Es kommt darauf an, wie du arbeitest. Wenn du täglich schreibst und KI als zweites Paar Augen willst — nicht als Ghostwriter — passt Notebook Archive am besten. Wenn du ein vollständiges Team-Wiki brauchst, ist Notion die solidere Wahl. Wenn dir Datenschutz und lokale Dateien wichtig sind, nimm Obsidian.",
  },
  {
    q: "Gibt es eine kostenlose KI-Notizen-App auf Deutsch?",
    a: "Ja. Notebook Archive, Notion und Obsidian funktionieren alle auf Deutsch und haben kostenlose Tarife, die für den echten Alltag reichen. Kostenlose Tarife begrenzen meist die monatliche KI-Nutzung — genau das solltest du vergleichen, nicht den Headline-Preis.",
  },
  {
    q: "Sind meine Notizen sicher in einer KI-Notizen-App?",
    a: "Bei seriösen Anbietern (Notebook Archive, Notion, Obsidian) werden Notizen während der Übertragung verschlüsselt und in der Datenbank pro Nutzer isoliert. Die wichtige Frage: Werden deine Notizen zum Training der KI-Modelle verwendet? Lies die Datenschutzerklärung jedes Anbieters und wähle im Zweifel jene, die das ausdrücklich ausschließen.",
  },
  {
    q: "Kann ich eine KI-Notizen-App offline nutzen?",
    a: "Obsidian und Notebook Archive funktionieren offline zum Schreiben und Lesen. KI-Funktionen brauchen eine Internetverbindung, weil das Modell auf einem Server läuft. Notion braucht für fast alles eine Verbindung.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: "de",
    headline: "Die beste KI-Notizen-App 2026 — ehrlicher Vergleich",
    description:
      "Ein ehrlicher Vergleich der besten KI-Notizen-Apps für Autoren, Studierende und Forschende — Notebook Archive, Notion, Obsidian und Mem.",
    datePublished: "2026-06-27",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/ki-notizen-app",
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

export default function BlogKiNotizenApp() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    const prev = document.documentElement.lang;
    document.documentElement.lang = "de";
    return () => { document.documentElement.lang = prev; };
  }, []);

  return (
    <>
      <SeoHead
        title="Die beste KI-Notizen-App 2026 — ehrlicher Vergleich"
        description="Die KI-Notizen-Apps, die wirklich funktionieren — Notebook Archive, Notion, Obsidian und Mem im ehrlichen Vergleich. Preise, Funktionen, für wen jede App geeignet ist."
        path="/blog/ki-notizen-app"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <article className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              — Vergleich · Aktualisiert Juni 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Die beste <span className="text-primary">KI-Notizen-App</span> im Jahr 2026
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Etwa vierzig Apps nennen sich gerade „KI-Notizen-Apps". Die meisten sind getarnte
              Meeting-Transkribierer oder Chat-Hüllen um deine Notizen. Wir haben die wenigen
              ausprobiert, die den Namen verdienen — und aufgeschrieben, welche wir einem Freund
              empfehlen würden, je nachdem wie er arbeitet.
            </p>
          </motion.header>

          <section className="prose prose-neutral max-w-none mb-12">
            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Was eine echte KI-Notizen-App ausmacht</h2>
            <p className="text-muted-foreground leading-relaxed">
              Eine KI-Notizen-App sollte dich Notizen schreiben lassen, sie organisieren und dir
              echte Hilfe vom Modell geben — nicht nur einen Knopf namens „KI", der ein Chatfenster
              öffnet. Wir haben alles aussortiert, was nur Meeting-Transkription macht, alles, was
              im Kern ein Wiki mit aufgesetzter KI ist, und alles, bei dem die KI nicht über deine
              eigenen Notizen nachdenken kann. Vier sind übrig geblieben.
            </p>

            <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Die Auswahl</h2>

            <div className="not-prose space-y-6 mt-6">
              {picks.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="border border-border rounded-lg p-6 bg-card"
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-2">
                      <h3 className="font-serif text-xl font-bold flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        {i + 1}. {p.name}
                      </h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{p.pricing}</span>
                    </div>
                    <p className="italic text-foreground/80 mb-3">{p.tagline}</p>
                    <p className="text-muted-foreground mb-3">{p.why}</p>
                    <p className="text-sm"><strong className="text-primary">Am besten für:</strong> <span className="text-muted-foreground">{p.bestFor}</span></p>
                    {p.disclosure && (
                      <p className="text-xs italic text-muted-foreground mt-4 border-t border-border pt-3">
                        {p.disclosure}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-4">Welche solltest du wählen?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong>Du schreibst täglich und willst KI als Denkhilfe, nicht als Ghostwriter:</strong> Notebook Archive.</li>
              <li>• <strong>Du brauchst ein Team-Wiki und Notizen in einem:</strong> Notion.</li>
              <li>• <strong>Du willst lokale Dateien und volle Kontrolle:</strong> Obsidian.</li>
              <li>• <strong>Du hasst Ordner und willst, dass die App sortiert:</strong> Mem.</li>
            </ul>

            <h2 className="font-serif text-2xl font-bold mt-16 mb-6">Häufige Fragen</h2>
            <div className="not-prose space-y-6">
              {faq.map((f) => (
                <div key={f.q} className="border-l-2 border-primary/40 pl-4">
                  <h3 className="font-serif text-lg font-bold mb-2">{f.q}</h3>
                  <p className="text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">
              Probier die App, die wir gebaut haben
            </p>
            <p className="text-muted-foreground mb-6">
              Notebook Archive ist kostenlos zum Starten. Keine Kreditkarte nötig.
            </p>
            <Link
              to={CTA}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Notebook Archive öffnen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
