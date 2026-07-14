// AppDetailCard - intentionally asymmetric. No icon grids, no numbered anatomy.

export interface AppDetailCardProps {
  index?: number; // kept for back-compat, not rendered
  name: string;
  pricing: string;
  imageUrl: string;
  imageAlt: string;
  siteUrl: string;
  tagline: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  ourTake?: string;
  disclosure?: string;
  /** Optional first-person aside - use on 1-2 cards to break template feel. */
  aside?: string;
  /** Optional opener that replaces the tagline line to break card rhythm. */
  opener?: string;
  /** Pricing pill tone - free=sky, paid-only=rose, mixed=amber (default). */
  pricingTone?: "amber" | "sky" | "rose";
}

const PRICING_TONE = {
  amber: "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  sky:   "bg-sky-100 text-sky-900 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/30",
  rose:  "bg-rose-100 text-rose-900 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-500/30",
} as const;

export function AppDetailCard(p: AppDetailCardProps) {
  const isOurSite = /notebookarchive\.lovable\.app/i.test(p.siteUrl);
  let resolvedHref = p.siteUrl;
  if (isOurSite && typeof window !== "undefined") {
    try {
      const url = new URL(p.siteUrl);
      const slug = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "blog";
      if (!url.searchParams.has("ref")) url.searchParams.set("ref", "blog");
      if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "blog");
      if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "organic");
      if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", slug);
      resolvedHref = url.toString();
    } catch { /* ignore */ }
  }
  const linkRel = isOurSite ? "noopener noreferrer" : "noopener noreferrer nofollow";

  const m = /([^/]+)\.(png|jpg|jpeg)(?:\?|$)/i.exec(p.imageUrl);
  const slug = m ? m[1] : null;
  const eager = p.index === 1;
  // Auto-rotate layout so a list of cards doesn't repeat identical anatomy.
  // 0,3,6 → top image (default); 1,4 → image right (asymmetric); 2,5 → text-first, image below.
  const idx = p.index ?? 0;
  const variant: "top" | "right" | "below" =
    idx % 3 === 1 ? "right" : idx % 3 === 2 ? "below" : "top";

  const imageBlock = slug ? (
    <a
      href={resolvedHref}
      target="_blank"
      rel={linkRel}
      className="block group overflow-hidden rounded-md border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
    >
      <picture>
        <source type="image/avif" srcSet={`/blog-img/${slug}-800.avif 800w, /blog-img/${slug}-1600.avif 1600w`} sizes="(max-width: 768px) 100vw, 760px" />
        <source type="image/webp" srcSet={`/blog-img/${slug}-800.webp 800w, /blog-img/${slug}-1600.webp 1600w`} sizes="(max-width: 768px) 100vw, 760px" />
        <img src={`/blog-img/${slug}-800.webp`} alt={p.imageAlt} width={1600} height={1000} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      </picture>
    </a>
  ) : (
    <a href={resolvedHref} target="_blank" rel={linkRel} className="block group overflow-hidden rounded-md border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5">
      <img src={p.imageUrl} alt={p.imageAlt} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchPriority: "high" as const } : {})} className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
    </a>
  );

  return (
    <section className="border-t border-border pt-8 mt-8 first:border-t-0 first:pt-0 first:mt-0">
      <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          {p.name}
        </h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${PRICING_TONE[p.pricingTone ?? "amber"]}`}>
          {p.pricing}
        </span>
      </div>
      {p.opener ? (
        <p className="text-foreground/85 mb-4 leading-relaxed">{p.opener}</p>
      ) : (
        <p className="italic text-foreground/80 mb-4">{p.tagline}</p>
      )}

      {variant === "top" && <div className="mb-5">{imageBlock}</div>}

      {variant === "right" ? (
        <div className="md:grid md:grid-cols-[1fr_18rem] md:gap-6 md:items-start">
          <div>
            <p className="text-foreground/80 leading-relaxed mb-5">{p.description}</p>
            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
              <strong className="text-foreground">What's good. </strong>
              {p.pros.join(". ")}.
            </p>
            <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
              <strong className="text-foreground/90">Where it falls short. </strong>
              {p.cons.join(". ")}.
            </p>
          </div>
          <div className="mb-5 md:mb-0 md:mt-1">{imageBlock}</div>
        </div>
      ) : (
        <>
          <p className="text-foreground/80 leading-relaxed mb-5">{p.description}</p>
          <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
            <strong className="text-foreground">What's good. </strong>
            {p.pros.join(". ")}.
          </p>
          <p className="text-sm text-foreground/70 mb-4 leading-relaxed">
            <strong className="text-foreground/90">Where it falls short. </strong>
            {p.cons.join(". ")}.
          </p>
        </>
      )}

      {variant === "below" && <div className="my-5">{imageBlock}</div>}


      {p.aside && (
        <p className="text-sm text-foreground/80 italic border-l-2 border-primary/40 pl-4 my-4">
          {p.aside}
        </p>
      )}

      <p className="text-sm text-foreground/80">
        <strong className="text-foreground">Best for: </strong>
        {p.bestFor}
      </p>

      {p.ourTake && (
        <p className="text-sm text-foreground/80 mt-3">
          <strong className="text-foreground">Where Notespace wins: </strong>
          {p.ourTake}
        </p>
      )}


      {p.disclosure && (
        <p className="text-xs italic text-muted-foreground mt-4">{p.disclosure}</p>
      )}
    </section>
  );
}
