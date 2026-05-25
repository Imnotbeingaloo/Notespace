import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, Send, Wand2, BookOpen, Check, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNotebooks } from "@/context/NotebookContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

export function AskAIPanel({ onApplyEdit }: AskAIPanelProps) {
  const { activeNote } = useNotebooks();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "edit">("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const callAI = async (action: "explain" | "edit" | "analyze", instruction?: string) => {
    if (!activeNote) return;
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content:
        action === "explain"
          ? instruction || "Explain this note"
          : action === "edit"
          ? `Edit: ${instruction}`
          : instruction || "Analyze this note",
      intent: action === "edit" ? "edit" : action === "explain" ? "explain" : "chat",
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
          noteTitle: activeNote.title,
          noteContent: activeNote.content,
          editInstruction: action === "edit" ? instruction : undefined,
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
        className="relative w-full sm:max-w-2xl h-[85vh] sm:h-[80vh] bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-primary/[0.04] to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-sans font-bold text-foreground text-sm leading-none">Ask AI</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[300px]">
                About "{activeNote.title}"
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode toggle + quick actions */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-muted/60">
            <button
              onClick={() => setMode("chat")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Explain
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                mode === "edit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <button
            onClick={() => mode === "edit" ? null : callAI("explain")}
            disabled={loading || mode === "edit"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Explain this note
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-8 w-8 text-primary/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask anything about your note, or use the quick actions above.
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
      </motion.div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-accent/10"
        title="Ask AI"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask AI
      </button>
      {typeof document !== "undefined" && createPortal(<AnimatePresence>{panel}</AnimatePresence>, document.body)}
    </>
  );
}
