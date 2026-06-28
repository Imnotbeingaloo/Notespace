import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SeoHead } from "@/components/SeoHead";
import { breadcrumbsJsonLd } from "@/lib/seo-breadcrumbs";
import Footer from "@/components/Footer";

const REF = "template-revision-timetable";
const CTA = `/auth?ref=${REF}&utm_source=template&utm_medium=organic&utm_campaign=revision-timetable-template`;

const weeklyTemplate = `| Time   | Mon         | Tue         | Wed         | Thu         | Fri         | Sat              | Sun       |
|--------|-------------|-------------|-------------|-------------|-------------|------------------|-----------|
| 16:00  | Biology     | Maths       | English     | Chemistry   | History     | Past paper       | Rest      |
| 17:00  | Chemistry   | Physics     | History     | Biology     | English     | Past paper review| Review    |
| 18:00  | Break       | Break       | Break       | Break       | Break       | Break            | Plan week |
| 19:00  | Maths       | English     | Physics     | Maths       | Chemistry   | Free             | -         |`;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: "Free Revision Timetable Template",
    description:
      "Free weekly revision timetable template for GCSE and A-level students. Markdown, PDF, and one-click open in Notebook Archive.",
    learningResourceType: "Template",
    educationalUse: "Revision planning",
    isAccessibleForFree: true,
  },
  breadcrumbsJsonLd([
    { name: "Templates", path: "/templates" },
    { name: "Revision Timetable Template", path: "/templates/revision-timetable-template" },
  ]),
];

export default function TemplateRevisionTimetable() {
  useEffect(() => {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <>
      <SeoHead
        title="Free Revision Timetable Template (GCSE & A-Level)"
        description="A free revision timetable template for GCSE and A-level - weekly, fortnightly, and exam-week variants. Copy, print, or open in Notebook Archive in one click."
        path="/templates/revision-timetable-template"
        jsonLd={jsonLd}
        alternateLocales={["en-GB", "en-AU", "en-US"]}
      />
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader />

        <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-4">
              - Free template
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Free <span className="text-primary">Revision Timetable Template</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A revision timetable template that doesn't require a spreadsheet PhD. Copy it into any document, print it for the wall, or open it as a live notebook you can tick off.
            </p>
          </motion.header>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">Weekly template</h2>
            <p className="text-muted-foreground mb-4">Six subjects on rotation, one rest day, one Saturday for past papers. Adjust subjects and slot times to suit your week.</p>
            <pre className="bg-card border border-border rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed">{weeklyTemplate}</pre>
            <Link
              to={CTA}
              className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Download className="h-4 w-4" />
              Open this template in Notebook Archive
            </Link>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">Three variants</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>• <strong className="text-foreground">Weekly</strong> - the table above. Best for 8-12 weeks out.</li>
              <li>• <strong className="text-foreground">Fortnightly</strong> - rotate heavy subjects every other week. Good for content-heavy A-levels.</li>
              <li>• <strong className="text-foreground">Exam-week intensive</strong> - past papers each morning, content gaps each afternoon. The final 1-2 weeks only.</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              All three are bundled when you open the template in the app.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-serif text-2xl font-bold mb-4">How to use it</h2>
            <ol className="space-y-3 text-muted-foreground list-decimal pl-5">
              <li>Open the template - it copies into a new notebook automatically.</li>
              <li>Replace the subject names with yours. Add or remove rows for slot times.</li>
              <li>Tick each slot off as you finish it. The weekly chart fills in for you.</li>
              <li>On Sunday, glance at what slipped and shift it into next week.</li>
            </ol>
          </section>

          <div className="border-t border-border pt-10 text-center">
            <p className="font-serif text-2xl font-bold mb-4">Skip the spreadsheet</p>
            <p className="text-muted-foreground mb-6">Open the template in Notebook Archive and start ticking off sessions today.</p>
            <Link to={CTA} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
              Use the template free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/revision-timetable" className="text-sm text-primary hover:underline">→ Revision timetable maker</Link>
              <Link to="/study-planner" className="text-sm text-primary hover:underline">→ Study planner</Link>
              <Link to="/blog/how-to-make-a-revision-timetable" className="text-sm text-primary hover:underline">→ How-to guide</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
