import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import Footer from "@/components/Footer";

const REF = "blog-hsc-vce-study-notes";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=hsc-vce-notes`;

const faq = [
  { q: "How do I make HSC study notes?", a: "One A4 page per syllabus dot point, in your own words, with one worked example. Re-read once, then convert to flashcards. Don't transcribe textbooks - that's the slowest way to learn nothing." },
  { q: "How do I make VCE study notes?", a: "Map every notes page to a study-design dot point. Two-column: content on the left, exam application on the right. The right column is what gets marked." },
  { q: "How long should HSC study notes be?", a: "Aim for 30-60 pages per subject - any more and you won't re-read them. Less is fine; flashcards do the recall work, notes are for synthesis." },
  { q: "Is writing study notes worth it for HSC?", a: "Yes, if you actually re-read and quiz from them. No, if they're a copy-paste of the textbook. The act of compressing is the learning - so write them yourself." },
  { q: "What's the best app for HSC and VCE notes?", a: "Anything that lets you organize by subject, search instantly, and run flashcards or AI-explain on what you wrote. Notebook Archive does all three on a free plan." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "HSC & VCE Study Notes - How to Make Notes That Actually Work",
    description:
      "How to write HSC and VCE study notes that actually move ATAR. Per-subject techniques, structure tips, and a free study planner template.",
    datePublished: "2026-06-28",
    dateModified: "2026-06-28",
    author: { "@type": "Organization", name: "Notebook Archive" },
    publisher: { "@type": "Organization", name: "Notebook Archive" },
    mainEntityOfPage: "https://notebookarchive.lovable.app/blog/hsc-vce-study-notes-guide",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  breadcrumbsJsonLd([
    { name: "Blog", path: "/blog" },
    { name: "HSC & VCE Study Notes", path: "/blog/hsc-vce-study-notes-guide" },
  ]),
];

export default function BlogHSCVCEStudyNotes() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        type="article"
        title="HSC & VCE Study Notes - How to Make Notes That Actually Work"
        description="How to write HSC and VCE study notes that move ATAR. Structure, per-subject techniques, and a free study planner template for Year 12 students."
        path="/blog/hsc-vce-study-notes-guide"
        jsonLd={jsonLd}
        alternateLocales={["en-AU"]}
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
              - For Year 12 · HSC & VCE · 2026
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="text-primary">HSC & VCE Study Notes</span> That Actually Work
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The notes you write in Year 12 are either your biggest asset or your biggest waste of time. Here's how to make sure they're the first.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">The principle: notes are for compression, not transcription</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Copying out the textbook feels productive. It isn't. The grade-mover is <strong className="text-foreground">putting the content in your own words</strong> against the syllabus dot points - that act of compression is the learning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Then run active recall (flashcards, blurting, past papers) on what you wrote. Notes are the input. Recall is the output. Most students do too much input and not enough output.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">HSC notes structure</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• One page per syllabus dot point.</li>
              <li>• Your own words. Past student notes (atarnotes, acehsc) are reference, not a substitute.</li>
              <li>• One worked example per page.</li>
              <li>• Past-paper questions tagged to each page - so you know which dot points actually get examined.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">VCE notes structure</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• Two columns: content (left), exam application (right).</li>
              <li>• Map every page to a key knowledge dot point.</li>
              <li>• Highlight key skills separately - they're what the markers tick.</li>
              <li>• Drop in 50-mark exam questions inline. SACs reuse them.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">What to use Notebook Archive for</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong className="text-foreground">One notebook per subject.</strong> Sections for theory, past papers, mistakes.</li>
              <li>• <strong className="text-foreground">Tags across notebooks.</strong> Tag every page with the dot point - then jump to all biology pages on photosynthesis in one click.</li>
              <li>• <strong className="text-foreground">AI explain</strong> for whatever the textbook butchered. Stays in the same window, doesn't lose your place.</li>
              <li>• <strong className="text-foreground">Study planner</strong> built in - so the notes and the schedule live in one app.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Free plan covers everything above.{" "}
              <Link to="/study-planner" className="text-primary hover:underline">See the study planner</Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mt-8 mb-6">Frequently asked</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`item-${i}`}>
                  <AccordionTrigger className="font-serif text-lg text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <div className="border-t border-border pt-10 mt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">Start your Year 12 notebook</p>
            <p className="text-muted-foreground mb-6">Free plan. Subjects, tags, AI explain, and a study planner - all in one notebook.</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Open Notebook Archive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
}
