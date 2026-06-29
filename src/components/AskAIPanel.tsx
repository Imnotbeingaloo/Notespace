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

  // Easter egg: plays exactly once per panel open. After 5s of inactivity on
  // an empty conversation, show a short animated scene for ~4s, then retire it.
  const eggPlayedRef = useRef(false);
  useEffect(() => {
    if (!open) { eggPlayedRef.current = false; setIdleEgg(false); return; }
    if (eggPlayedRef.current) return;
    if (messages.length > 0 || input.trim() || loading) return;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const show = setTimeout(() => {
      eggPlayedRef.current = true;
      setIdleEgg(true);
      hide = setTimeout(() => setIdleEgg(false), 4200);
    }, 5000);
    return () => { clearTimeout(show); if (hide) clearTimeout(hide); };
  }, [open, messages.length, input, loading]);



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
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-4"
                    aria-hidden
                  >
                    {/* Thought-line vignette: a flowing path draws across,
                        a glowing comet traces it, and a soft sparkle pops at the end. */}
                    <svg width="220" height="80" viewBox="0 0 220 80" className="overflow-visible">
                      <defs>
                        <linearGradient id="aiThoughtStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                          <stop offset="35%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                        </linearGradient>
                        <radialGradient id="aiThoughtGlow">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
                          <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </radialGradient>
                        <filter id="aiSoftBlur" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" />
                        </filter>
                      </defs>

                      {/* soft ambient glow following the path */}
                      <motion.path
                        d="M 10 50 C 50 10, 90 90, 130 40 S 200 50, 210 30"
                        stroke="url(#aiThoughtStroke)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#aiSoftBlur)"
                        opacity={0.35}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                      />

                      {/* crisp drawn line */}
                      <motion.path
                        d="M 10 50 C 50 10, 90 90, 130 40 S 200 50, 210 30"
                        stroke="url(#aiThoughtStroke)"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
                      />

                      {/* comet traveling along the path */}
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.8, times: [0, 0.1, 0.9, 1], ease: "easeOut" }}
                      >
                        <circle r="14" fill="url(#aiThoughtGlow)">
                          <animateMotion
                            dur="1.6s"
                            fill="freeze"
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.65 0 0.35 1"
                            path="M 10 50 C 50 10, 90 90, 130 40 S 200 50, 210 30"
                          />
                        </circle>
                        <circle r="2.5" fill="hsl(var(--primary))">
                          <animateMotion
                            dur="1.6s"
                            fill="freeze"
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="spline"
                            keySplines="0.65 0 0.35 1"
                            path="M 10 50 C 50 10, 90 90, 130 40 S 200 50, 210 30"
                          />
                        </circle>
                      </motion.g>

                      {/* sparkle payoff at the end of the path */}
                      <motion.g
                        transform="translate(210 30)"
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 0.95] }}
                        transition={{ duration: 1.4, delay: 1.55, times: [0, 0.25, 0.7, 1], ease: [0.16, 1, 0.3, 1] }}
                      >
                        <circle r="10" fill="url(#aiThoughtGlow)" />
                        <path
                          d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
                          fill="hsl(var(--primary))"
                        />
                      </motion.g>

                      {/* three quiet idea-dots that fade in along the way */}
                      {[
                        { cx: 60, cy: 32, delay: 0.45 },
                        { cx: 110, cy: 58, delay: 0.85 },
                        { cx: 165, cy: 36, delay: 1.2 },
                      ].map((d, i) => (
                        <motion.circle
                          key={i}
                          cx={d.cx}
                          cy={d.cy}
                          r={1.6}
                          fill="hsl(var(--primary))"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: [0, 0.9, 0.5], scale: [0, 1, 1] }}
                          transition={{ duration: 0.9, delay: d.delay, ease: "easeOut" }}
                        />
                      ))}
                    </svg>
                  </motion.div>
                ) : (
                  <div key="spacer" className="h-8 w-8 mb-3" />
                )}
              </AnimatePresence>
              <p className="text-sm text-muted-foreground">
                {idleEgg ? "A thought taking shape - ask anything." : "Ask anything about your note, or use the quick actions below."}
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
