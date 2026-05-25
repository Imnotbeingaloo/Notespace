import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const GET_SHARED_NOTE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-shared-note`;

export default function SharedNote() {
  const { token } = useParams<{ token: string }>();
  const [note, setNote] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedNote = async () => {
      if (!token) { setError("Invalid link"); setLoading(false); return; }

      const resp = await fetch(GET_SHARED_NOTE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ token }),
      });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setError(data?.error || "Unable to load this shared note.");
        setLoading(false);
        return;
      }

      if (!data?.title) {
        setError("This shared note doesn't exist, has expired, or has been removed.");
        setLoading(false);
        return;
      }

      setNote({ title: data.title, content: data.content || "" });
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
    <div className="min-h-screen bg-background">
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
    </div>
  );
}
