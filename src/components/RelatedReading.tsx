import { Link } from "react-router-dom";

interface RelatedItem {
  to: string;
  title: string;
  blurb: string;
}

interface RelatedReadingProps {
  currentPath: string;
  items: RelatedItem[];
}

/**
 * Small "Related reading" block for SEO internal linking between
 * topically-related guides and templates. Filters out the current page.
 */
export function RelatedReading({ currentPath, items }: RelatedReadingProps) {
  const filtered = items.filter((i) => i.to !== currentPath);
  if (filtered.length === 0) return null;
  return (
    <section className="border-t border-border bg-muted/20 py-12">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-serif text-2xl font-bold mb-6">Related reading</h2>
        <ul className="grid sm:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="block border border-border rounded-lg p-4 bg-card hover:bg-muted transition"
              >
                <div className="font-semibold mb-1">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.blurb}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export const STUDY_PLANNER_RELATED: RelatedItem[] = [
  {
    to: "/blog/how-to-make-a-study-plan",
    title: "How to make a study plan",
    blurb: "Step-by-step guide with a free weekly template.",
  },
  {
    to: "/blog/how-to-make-a-study-plan-for-exams",
    title: "How to make a study plan for exams",
    blurb: "Six-week exam plan you'll actually follow.",
  },
  {
    to: "/blog/how-to-make-a-revision-timetable",
    title: "How to make a revision timetable",
    blurb: "GCSE & A-level revision plan with template.",
  },
  {
    to: "/templates/study-planner",
    title: "Study planner template",
    blurb: "Open the ready-made template in Notebook Archive.",
  },
];
