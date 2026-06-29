import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Send, Wand2, BookOpen, Check, User, Bot, AlignLeft, List, Lightbulb, PenLine, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const AI_TOOLS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tools`;

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: "explain" | "edit" | "chat";
  applied?: boolean;
};

interface AskAIPanelProps {
  onApplyEdit?: (newContent: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "chat" | "edit";
  hideTrigger?: boolean;
}

/** Quiet editorial vignette: a serif word swaps through three thoughts
 *  with a soft ink underline. One-shot. Honors prefers-reduced-motion. */
function IdleVignette({ reducedMotion }: { reducedMotion: boolean }) {
  const words = ["idea", "spark", "note"];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion) return;
    const t1 = setTimeout(() => setI(1), 1100);
    const t2 = setTimeout(() => setI(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="relative mx-auto flex flex-col items-center" style={{ width: 180 }}>
        <span
          className="text-foreground/85 italic leading-none"
          style={{ fontFamily: 'Merriweather, Georgia, "Times New Roman", serif', fontSize: 32, letterSpacing: "-0.005em" }}
        >
          idea
        </span>
        <div className="mt-1.5 h-[1.75px] w-[110px] rounded-full bg-primary/60" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex flex-col items-center" style={{ width: 180 }}>
      <div className="relative h-[44px] flex items-end justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[i]}
            initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="text-foreground/85 italic leading-none"
            style={{
              fontFamily: 'Merriweather, Georgia, "Times New Roman", serif',
              fontSize: 32,
              letterSpacing: "-0.005em",
              fontWeight: 400,
            }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </div>
      <svg width="120" height="10" viewBox="0 0 120 10" className="mt-1.5 overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="aiIdleInk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 4 5 Q 60 2, 116 5"
          stroke="url(#aiIdleInk)"
          strokeWidth={1.75}
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.95, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
        />
      </svg>
    </div>
  );
}

/** Detect prefers-reduced-motion with live updates. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}


export function AskAIPanel({ onApplyEdit, open: controlledOpen, onOpenChange, defaultMode = "chat", hideTrigger = false }: AskAIPanelProps) {
  const { activeNote } = useNotebooks();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "edit">(defaultMode);
  const [loading, setLoading] = useState(false);
  const [showEmptyNotice, setShowEmptyNotice] = useState(false);
  const [idleEgg, setIdleEgg] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const isNoteEmpty = !((activeNote?.content ?? "").replace(/[\s\u200B\u2063]|&#8203;/g, "").length);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Per-note + per-mode message history. Each (noteId, mode) pair keeps
  // its own conversation so Explain and Edit don't leak between each other,
  // and notes don't share chats.
  const [conversations, setConversations] = useState<Record<string, Msg[]>>({});
  const convoKey = activeNote ? `${activeNote.id}::${mode}` : "";
  const messages = conversations[convoKey] ?? [];
  const setMessages = (updater: Msg[] | ((prev: Msg[]) => Msg[])) => {
    setConversations((prev) => {
      const current = prev[convoKey] ?? [];
      const next = typeof updater === "function" ? (updater as (p: Msg[]) => Msg[])(current) : updater;
      return { ...prev, [convoKey]: next };
    });
  };

  // Sync mode whenever the caller changes defaultMode (e.g. opened from AI Edit trigger)
  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);


  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Easter egg: plays once when the panel opens on an empty conversation.
  // Quiet editorial vignette - cycles through three words, then retires.
  const eggPlayedRef = useRef(false);
  useEffect(() => {
    if (!open) { eggPlayedRef.current = false; setIdleEgg(false); return; }
    if (eggPlayedRef.current) return;
    if (messages.length > 0 || input.trim() || loading) return;
    eggPlayedRef.current = true;
    const total = reducedMotion ? 1400 : 3200;
    const show = setTimeout(() => setIdleEgg(true), 220);
    const hide = setTimeout(() => setIdleEgg(false), 220 + total);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [open, messages.length, input, loading, reducedMotion]);




  const callAI = async (action: "explain" | "edit" | "analyze" | "format", instruction?: string) => {
    if (!activeNote) return;
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content:
        action === "explain"
          ? instruction || "Explain this note"
          : action === "edit"
          ? `Edit: ${instruction}`
          : action === "format"
          ? "Format this note into clean structured markdown"
          : instruction || "Analyze this note",
      intent: action === "edit" || action === "format" ? "edit" : action === "explain" ? "explain" : "chat",
    };
    const assistantId = crypto.randomUUID();
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", content: "", intent: userMsg.intent }]);
    setLoading(true);
    setInput("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Please sign in");

      const resp = await fetch(AI_TOOLS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action,
          noteTitle: activeNote.title || "Untitled",
          noteContent: activeNote.content ?? "",
          editInstruction: action === "edit" ? (instruction || "Improve this note: fix grammar, clarity, and flow") : undefined,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Error ${resp.status}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              text += content;
              setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: text } : msg)));
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: `Error: ${e.message || "Failed"}` } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    if (mode === "edit") {
      callAI("edit", text);
    } else {
      const editish = /^(edit|rewrite|fix|change|update|make it|shorten|expand|simplify|translate|convert)/i.test(text);
      callAI(editish ? "edit" : "analyze", text);
    }
  };

  const handleApply = (msg: Msg) => {
    if (!msg.content || !onApplyEdit) return;
    onApplyEdit(msg.content);
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, applied: true } : x)));
    toast.success("Changes applied to your note");
  };

  if (!activeNote) return null;

  const panel = open ? (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full sm:max-w-2xl h-[92vh] sm:h-[80vh] bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border bg-gradient-to-r from-primary/[0.04] to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-sans font-bold text-foreground text-sm leading-none">Ask AI</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                About "{activeNote.title}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Close Ask AI"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-border">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-muted/60 shrink-0">
            <button
              onClick={() => setMode("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "edit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setMode("chat")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Explain
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {idleEgg ? (
                  <motion.div
                    key="egg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-4 select-none"
                    aria-hidden
                  >
                    <IdleVignette reducedMotion={reducedMotion} />
                  </motion.div>
                ) : (
                  <div key="spacer" className="h-6 w-6 mb-2" />
                )}
              </AnimatePresence>


              <p className="text-sm text-muted-foreground">
                {idleEgg
                  ? "A blank page is just the start. Ask anything."
                  : "Ask anything about your note, or use the quick actions below."}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-2">
                Try: "Summarize the key points" · "Rewrite in plain English" · "What am I missing?"
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className={`flex-1 max-w-[85%] ${msg.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block text-left rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-foreground prose-headings:font-sans prose-headings:text-foreground prose-p:text-foreground prose-p:my-1.5 prose-li:text-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-background/50 prose-code:px-1 prose-code:rounded prose-pre:bg-background/50">
                      {msg.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "assistant" && msg.intent === "edit" && msg.content && !loading && (
                  <div className="mt-2">
                    {msg.applied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="h-3 w-3" /> Applied to note
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(msg)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        Apply to note
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 bg-muted/20">
          {/* Quick action chips - small, essential set, single row, no scroller */}
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {(mode === "edit"
              ? [
                  { key: "improve", icon: Wand2, label: "Improve writing", instr: "Improve this note: fix grammar, clarity, and flow. Preserve meaning." },
                  { key: "continue", icon: PenLine, label: "Continue writing", instr: "Continue writing this note in the same voice and structure. Add the next 2-3 paragraphs." },
                  { key: "format", icon: AlignLeft, label: "Format", action: "format" as const },
                ]
              : [
                  { key: "explain", icon: BookOpen, label: "Explain", instr: undefined },
                  { key: "summary", icon: List, label: "Summarize", instr: "Summarize this note in 5 short bullets, in the note's own words." },
                  { key: "missing", icon: Lightbulb, label: "What am I missing?", instr: "Read this note critically. List concrete gaps, weak arguments, missing context, and questions worth answering." },
                ]
            ).map(({ key, icon: Icon, label, instr, action }: any) => (
              <button
                key={key}
                onClick={() => {
                  if (isNoteEmpty) { setShowEmptyNotice(true); return; }
                  if (action === "format") { callAI("format"); return; }
                  callAI(mode === "edit" ? "edit" : "explain", instr);
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg border border-border bg-background text-foreground hover:bg-muted hover:border-primary/30 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <Icon className="h-3 w-3 text-primary" /> {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === "edit" ? "Describe the edit (e.g., fix grammar, shorten, add a conclusion)…" : "Ask anything about your note…"}
              rows={1}
              className="flex-1 resize-none bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 max-h-32"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/70 mt-1.5 px-1">
            AI can make mistakes. Review before applying edits.
          </p>
        </div>

        {/* Empty-note popup: blocks edit/explain/format until the note has content */}
        {showEmptyNotice && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm p-6">
            <div className="max-w-sm w-full rounded-2xl bg-card border border-border shadow-xl p-5 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <PenLine className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground text-sm">Your note is empty</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                Write something in your note first, then I can edit, explain, or format it.
              </p>
              <button
                onClick={() => setShowEmptyNotice(false)}
                className="mt-4 inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      {!hideTrigger && (
        <button
          onClick={() => setOpen(true)}
          className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-accent/10"
          title="Ask AI"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Ask AI
        </button>
      )}
      {typeof document !== "undefined" && createPortal(<AnimatePresence>{panel}</AnimatePresence>, document.body)}
    </>
  );
}
