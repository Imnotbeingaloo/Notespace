import { useEffect, useRef, useState } from "react";
import { Check, X, Sparkles } from "lucide-react";

export interface AppDetailCardProps {
  index: number;
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
  ourTake?: string; // "Where Notebook Archive wins" line (omit for NA itself)
  disclosure?: string; // shown when this card is NA
}

export function AppDetailCard(p: AppDetailCardProps) {
  // If this card points to our own site, append referral params so we can
  // see in auth.users.raw_user_meta_data who clicked through from which blog.
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
      if (!url.searchParams.has("utm_content")) url.searchParams.set("utm_content", "app-card-image");
      resolvedHref = url.toString();
    } catch {
      /* ignore URL parse issues */
    }
  }
  const linkRel = isOurSite ? "noopener noreferrer" : "noopener noreferrer nofollow";
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(p.index === 1);
  useEffect(() => {
    if (visible || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "-80px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return (
    <div
      ref={ref}
      className={`border border-border rounded-xl overflow-hidden bg-card shadow-sm cv-auto-card transition-all duration-500 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ contentVisibility: p.index === 1 ? "visible" : "auto", containIntrinsicSize: "900px 720px" }}
    >
      <a
        href={resolvedHref}
        target="_blank"
        rel={linkRel}
        className="block border-b border-border bg-muted/30 overflow-hidden group"
      >
        {(() => {
          // Derive optimized WebP variants from the original filename (e.g. /…/notebook-archive.png -> notebook-archive)
          const m = /([^/]+)\.(png|jpg|jpeg)(?:\?|$)/i.exec(p.imageUrl);
          const slug = m ? m[1] : null;
          const eager = p.index === 1;
          if (slug) {
            return (
              <picture>
                <source
                  type="image/avif"
                  srcSet={`/blog-img/${slug}-800.avif 800w, /blog-img/${slug}-1600.avif 1600w`}
                  sizes="(max-width: 768px) 100vw, 900px"
                />
                <source
                  type="image/webp"
                  srcSet={`/blog-img/${slug}-800.webp 800w, /blog-img/${slug}-1600.webp 1600w`}
                  sizes="(max-width: 768px) 100vw, 900px"
                />
                <img
                  src={`/blog-img/${slug}-1600.webp`}
                  alt={p.imageAlt}
                  width={1600}
                  height={1000}
                  loading={eager ? "eager" : "lazy"}
                  decoding="async"
                  {...({ fetchpriority: eager ? "high" : "low" } as any)}
                  className="w-full h-auto aspect-[16/10] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] bg-muted/40"
                />
              </picture>
            );
          }
          return (
            <img
              src={p.imageUrl}
              alt={p.imageAlt}
              width={1600}
              height={1000}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              {...({ fetchpriority: eager ? "high" : "low" } as any)}
              className="w-full h-auto aspect-[16/10] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02] bg-muted/40"
            />
          );
        })()}
      </a>

      <div className="p-6 md:p-8">
        <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
          <h3 className="font-serif text-2xl font-bold">
            {p.index}. {p.name}
          </h3>
          <span className="text-sm text-muted-foreground whitespace-nowrap">{p.pricing}</span>
        </div>
        <p className="italic text-foreground/80 mb-4">{p.tagline}</p>
        <p className="text-muted-foreground leading-relaxed mb-6">{p.description}</p>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-primary mb-3">Pros</h4>
            <ul className="space-y-2">
              {p.pros.map((pro) => (
                <li key={pro} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold text-accent mb-3">Cons</h4>
            <ul className="space-y-2">
              {p.cons.map((con) => (
                <li key={con} className="flex gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm pb-4 border-b border-border">
          <strong className="text-primary">Best for: </strong>
          <span className="text-muted-foreground">{p.bestFor}</span>
        </p>

        {p.ourTake && (
          <div className="mt-4 flex gap-3 items-start bg-primary/5 rounded-lg p-4">
            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-1" />
            <p className="text-sm text-foreground/85 leading-relaxed">
              <strong className="text-primary">Where Notebook Archive wins: </strong>
              {p.ourTake}
            </p>
          </div>
        )}

        {p.disclosure && (
          <p className="text-xs italic text-muted-foreground mt-4 border-t border-border pt-3">
            {p.disclosure}
          </p>
        )}
      </div>
    </motion.div>
  );
}
