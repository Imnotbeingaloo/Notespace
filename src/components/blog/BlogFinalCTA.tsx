import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

/**
 * Shared asymmetric final CTA for blog posts. Full-bleed dark band with
 * headline/body on the left and a primary button on the right. Replaces
 * the ad-hoc centered "Ready to..." blocks that used to end each post.
 */
export function BlogFinalCTA({
  title,
  body,
  to,
  cta = "Open Notebook Archive",
  secondaryTo,
  secondaryCta,
}: {
  title: ReactNode;
  body: ReactNode;
  to: string;
  cta?: string;
  secondaryTo?: string;
  secondaryCta?: string;
}) {
  return (
    <div className="not-prose relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-16 bg-foreground text-background py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1">
          <p className="font-serif text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {title}
          </p>
          <p className="text-background/70 text-lg leading-relaxed">
            {body}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto">
          {secondaryTo && secondaryCta && (
            <Link
              to={secondaryTo}
              className="inline-flex items-center gap-2 border border-background/30 text-background px-5 py-3 rounded-lg font-semibold hover:bg-background/10 transition whitespace-nowrap"
            >
              {secondaryCta}
            </Link>
          )}
          <Link
            to={to}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition whitespace-nowrap"
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogFinalCTA;
