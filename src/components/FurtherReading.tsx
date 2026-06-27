import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface BlogLink {
  to: string;
  title: string;
  blurb: string;
}

const ALL_LINKS: BlogLink[] = [
  {
    to: "/blog/best-note-taking-app-2026",
    title: "Best note taking app in 2026",
    blurb: "Seven apps compared honestly — with a clear pick for each kind of person.",
  },
  {
    to: "/blog/notion-alternatives-2026",
    title: "Notion alternatives, compared",
    blurb: "Six picks for people who only ever used Notion for notes.",
  },
  {
    to: "/blog/obsidian-alternatives-2026",
    title: "Obsidian alternatives, compared",
    blurb: "For people tired of maintaining a vault before they can write.",
  },
  {
    to: "/blog/evernote-alternatives-2026",
    title: "Evernote alternatives, compared",
    blurb: "The free tier shrank. The price climbed. Here's where people moved.",
  },
  {
    to: "/blog/onenote-alternatives-2026",
    title: "OneNote alternatives, compared",
    blurb: "Structure without the freeform mess — and without Microsoft 365.",
  },
  {
    to: "/blog/best-ai-note-taking-apps-2026",
    title: "Best AI note taking apps",
    blurb: "Seven apps that actually earn the 'AI' label — and which one fits you.",
  },
  {
    to: "/blog/best-note-taking-app-for-writers",
    title: "Best note taking app for writers",
    blurb: "Most lists are written for project managers. This one isn't.",
  },
  {
    to: "/blog/ai-note-taking-app-for-students",
    title: "Best AI note taking app for students",
    blurb: "Per-course notebooks, AI that explains, free tiers that actually work.",
  },
];

interface FurtherReadingProps {
  /** Slugs (without /blog/ prefix) to feature. Defaults to a curated 3. */
  slugs?: string[];
  /** Section heading copy. */
  heading?: string;
  /** Section eyebrow copy. */
  eyebrow?: string;
}

export function FurtherReading({
  slugs,
  heading = "Further reading",
  eyebrow = "— From the blog",
}: FurtherReadingProps) {
  const links = slugs
    ? slugs
        .map((s) => ALL_LINKS.find((l) => l.to === `/blog/${s}`))
        .filter(Boolean) as BlogLink[]
    : ALL_LINKS.slice(0, 3);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-3">
            {eyebrow}
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            {heading}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {links.map((l, i) => (
            <motion.div
              key={l.to}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={l.to}
                className="group block h-full border border-border rounded-xl p-5 bg-card hover:border-primary/40 hover:shadow-sm transition"
              >
                <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition">
                  {l.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {l.blurb}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read post
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
