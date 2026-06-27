import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SeoHead } from "@/components/SeoHead";

// Share tokens are long random strings. The literal ":token" placeholder or
// anything obviously malformed should fall through to the global 404 page.
const VALID_TOKEN = /^[A-Za-z0-9_-]{16,}$/;

export default function SharedNote() {
  const { token } = useParams<{ token: string }>();
  const tokenIsValid = !!token && VALID_TOKEN.test(token);
  const [note, setNote] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(!!tokenIsValid);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedNote = async () => {
      if (!tokenIsValid) return;

      const { data, error: rpcErr } = await supabase
        .rpc("get_shared_note" as any, { _token: token });

      if (rpcErr) {
        setError("Unable to load this shared note.");
        setLoading(false);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setError("This shared note doesn't exist, has expired, or has been removed.");
        setLoading(false);
        return;
      }

      setNote({ title: (row as any).title, content: (row as any).content });
      setLoading(false);
    };

    fetchSharedNote();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">{error}</p>
        <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Go to Notebook Archive
        </Link>
      </div>
    );
  }

  return (
    <>
      {note && (
        <SeoHead
          title={`${note.title} — Notebook Archive`}
          description={(note.content || "").slice(0, 160).replace(/\s+/g, " ").trim() || "A shared note from Notebook Archive."}
          path={`/shared/${token ?? ""}`}
          noindex
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: note.title,
            publisher: { "@type": "Organization", name: "Notebook Archive" },
          }}
        />
      )}
      <main className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Notebook Archive" className="h-7 w-7 object-contain" />
            <span className="font-serif text-base font-bold text-foreground whitespace-nowrap">Notebook Archive</span>
          </Link>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Shared Note</span>
        </div>
      </header>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-3xl px-6 py-12"
      >
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">{note?.title}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note?.content || ""}</ReactMarkdown>
        </div>
      </motion.article>
      </main>
    </>
  );
}
