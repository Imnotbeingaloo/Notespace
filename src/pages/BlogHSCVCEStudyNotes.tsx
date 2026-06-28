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
import heroAsset from "@/assets/blog/hero-hsc.jpg.asset.json";
import {
  BlogHero,
  BlogCallout,
  BlogPullQuote,
  BlogStatGrid,
  BlogKeyTakeaways,
  BlogCompareTable,
  BlogDivider,
} from "@/components/blog/BlogVisuals";

const REF = "blog-hsc-vce-study-notes";
const CTA = `/auth?ref=${REF}&utm_source=blog&utm_medium=organic&utm_campaign=hsc-vce-notes`;

const faq = [
  { q: "How do I make HSC study notes?", a: "One A4 page per syllabus dot point, in your own words, with one worked example. Re-read once, then convert to flashcards. Don't transcribe textbooks - that's the slowest way to learn nothing." },
  { q: "How do I make VCE study notes?", a: "Map every notes page to a study-design dot point. Two-column: content on the left, exam application on the right. The right column is what gets marked." },
  { q: "How long should HSC study notes be?", a: "Aim for 30-60 pages per subject - any more and you won't re-read them. Less is fine; flashcards do the recall work, notes are for synthesis." },
  { q: "Is writing study notes worth it for HSC?", a: "Yes, if you actually re-read and quiz from them. No, if they're a copy-paste of the textbook. The act of compressing is the learning - so write them yourself." },
  { q: "What's the best app for HSC and VCE notes?", a: "Anything that lets you organize by subject, search instantly, and run flashcards or AI-explain on what you wrote. Notebook Archive does all three on a free plan." },
  { q: "Should I share notes with classmates?", a: "Yes, but reciprocally and after you've made your own. Reading someone else's compressed notes is useful; outsourcing the act of compression isn't - that's where the learning happens." },
  { q: "How early should I start Year 12 notes?", a: "Week one. Notes you build during the year and refine in October beat notes you start from scratch in October. The hardest version is the cram-build in spring break." },
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
    image: `https://notebookarchive.lovable.app${heroAsset.url}`,
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
        image={heroAsset.url}
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
            className="mb-10"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              For Year 12 · HSC & VCE · 2026 · 8 min read
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              <span className="text-primary">HSC & VCE Study Notes</span> That Actually Work
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The notes you write in Year 12 are either your biggest asset or your
              biggest waste of time. Here's how to make sure they're the first -
              and why most students get this almost exactly backwards.
            </p>
          </motion.header>

          <BlogHero
            src={heroAsset.url}
            alt="A Year 12 binder with two-column HSC and VCE study notes alongside a syllabus dot-point checklist."
            caption="Two columns. Content on the left. Exam application on the right. The right column is what gets marked."
          />

          <BlogKeyTakeaways
            points={[
              "Notes are for compression, not transcription. Copying the textbook teaches nothing.",
              "Map every page to a syllabus dot point (HSC) or study-design dot point (VCE).",
              "Run active recall (flashcards, blurting, past papers) on what you wrote. Notes are the input, recall is the output.",
              "30-60 pages per subject. Beyond that you won't re-read them.",
              "Start in week one of Year 12. The cram-build in spring break is the brutal version.",
            ]}
          />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">The principle: notes are for compression, not transcription</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Copying out the textbook feels productive. It isn't. The grade-mover is{" "}
              <strong className="text-foreground">putting the content in your own words against the syllabus dot points</strong>
              - that act of compression is the learning. The page count drops, the
              comprehension rises, and the version you re-read in October is one
              you can actually use.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Then run active recall (flashcards, blurting, past papers) on what you
              wrote. Notes are the input. Recall is the output. Most students do too
              much input and not enough output - which is why they walk into trials
              "knowing the content" and still drop marks.
            </p>
          </section>

          <BlogPullQuote cite="The most common Year 12 mistake">
            Writing pretty notes is comforting. Writing notes you can be tested
            on tomorrow is useful. They are not the same activity.
          </BlogPullQuote>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">HSC notes structure</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li>• <strong className="text-foreground">One page per syllabus dot point.</strong> Concrete, not aspirational.</li>
              <li>• <strong className="text-foreground">Your own words.</strong> Past student notes (atarnotes, acehsc) are reference, not a substitute. Don't outsource your understanding.</li>
              <li>• <strong className="text-foreground">One worked example per page.</strong> The example is what your brain reaches for in the exam.</li>
              <li>• <strong className="text-foreground">Past-paper questions tagged to each page</strong> - so you know which dot points actually get examined and which are filler.</li>
              <li>• <strong className="text-foreground">A 'common errors' line at the bottom.</strong> Pulled from your own past-paper mistakes. This is the highest-leverage habit on the list.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">VCE notes structure</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li>• <strong className="text-foreground">Two columns:</strong> content (left), exam application (right).</li>
              <li>• <strong className="text-foreground">Map every page to a key knowledge dot point.</strong></li>
              <li>• <strong className="text-foreground">Highlight key skills separately</strong> - they're what the markers tick.</li>
              <li>• <strong className="text-foreground">Drop in 50-mark exam questions inline.</strong> SACs reuse them, almost word-for-word.</li>
              <li>• <strong className="text-foreground">Tag every page with the relevant area of study.</strong> Makes the end-of-year revision sort cleanly.</li>
            </ul>
          </section>

          <BlogDivider />

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">HSC vs VCE - a quick comparison</h2>
            <BlogCompareTable
              headers={["", "HSC", "VCE"]}
              rows={[
                ["Structure", "Syllabus dot points", "Study design + key knowledge"],
                ["Exam style", "Module-based, includes extended response", "Multiple-choice + short + extended, SAC-heavy"],
                ["Notes shape", "1 page per dot point", "Two-column: content + application"],
                ["Killer skill", "Quotation/source integration", "Application of theory to unseen scenarios"],
                ["When to start", "Week 1 of Year 12", "Week 1 of Year 12"],
              ]}
            />
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">What to use Notebook Archive for</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed">
              <li>• <strong className="text-foreground">One notebook per subject.</strong> Sections for theory, past papers, mistakes.</li>
              <li>• <strong className="text-foreground">Tags across notebooks.</strong> Tag every page with the dot point - then jump to all biology pages on photosynthesis in one click.</li>
              <li>• <strong className="text-foreground">AI explain</strong> for whatever the textbook butchered. Stays in the same window, doesn't lose your place.</li>
              <li>• <strong className="text-foreground">Study planner</strong> built in - so the notes and the schedule live in one app.</li>
            </ul>
            <BlogCallout title="Free plan covers everything above">
              Notebook Archive's free tier includes unlimited notebooks, tags, and
              the AI explain panel.{" "}
              <Link to="/study-planner" className="text-primary underline underline-offset-2 hover:text-primary/80">
                See the study planner
              </Link>.
            </BlogCallout>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4">The Year 12 timeline</h2>
            <BlogStatGrid
              stats={[
                { value: "30-60", label: "Pages per subject", sub: "Any more, you won't re-read" },
                { value: "Wk 1", label: "Start your notes", sub: "Term 1, Year 12" },
                { value: "8 wks", label: "Trial / Mock prep", sub: "Drop new content; past papers only" },
              ]}
            />
            <p className="text-muted-foreground leading-relaxed mt-6">
              Build during term. Compress over the holidays. Run flashcards and
              past papers in the final eight weeks. Notes that get written but
              never re-read are the most common waste of time in Year 12 - by
              far. Build for re-reading from day one.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-3xl font-bold mt-8 mb-6">Frequently asked</h2>
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
