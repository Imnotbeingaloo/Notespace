import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X } from "lucide-react";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
}

/**
 * Voice → text with a live popup:
 *  - Animated frequency bars driven by the mic input level
 *  - Live interim transcript visible while speaking
 *  - On Stop, the full transcript is sent back via onTranscript
 *    so the editor can insert it at the last cursor position.
 */
export function VoiceTranscription({ onTranscript }: VoiceTranscriptionProps) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => new Array(28).fill(4));

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        // Down/up-sample to 28 bars
        const bars: number[] = [];
        const step = data.length / 28;
        for (let i = 0; i < 28; i++) {
          const start = Math.floor(i * step);
          const end = Math.floor((i + 1) * step) || start + 1;
          let sum = 0;
          for (let j = start; j < end; j++) sum += data[j];
          const avg = sum / (end - start);
          // 0..255 → 4..56 height
          bars.push(4 + (avg / 255) * 52);
        }
        setLevels(bars);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError(e?.message || "Microphone access denied.");
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setInterim("");
    setFinalText("");
    setOpen(true);
    setListening(true);
    await startVisualizer();

    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser.");
      setListening(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let aggregate = "";

    recognition.onresult = (event: any) => {
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) {
          aggregate += (aggregate && !aggregate.endsWith(" ") ? " " : "") + txt.trim();
        } else {
          interimChunk += txt;
        }
      }
      setFinalText(aggregate);
      setInterim(interimChunk);
    };
    recognition.onerror = (e: any) => {
      if (e?.error && e.error !== "aborted") {
        setError(`Recognition error: ${e.error}`);
      }
    };
    recognition.onend = () => {
      // Auto-restart while user is still in listening state (Chrome cuts off after silence)
      if (listening && recognitionRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e: any) {
      setError(e?.message || "Could not start recognition.");
      setListening(false);
    }
  }, [listening, startVisualizer]);

  const stopAndInsert = useCallback(() => {
    setListening(false);
    const text = (finalText + (interim ? " " + interim : "")).trim();
    cleanup();
    if (text) onTranscript(text);
    setOpen(false);
    setInterim("");
    setFinalText("");
  }, [finalText, interim, cleanup, onTranscript]);

  const cancel = useCallback(() => {
    setListening(false);
    cleanup();
    setOpen(false);
    setInterim("");
    setFinalText("");
  }, [cleanup]);

  if (!isSupported) return null;

  return (
    <>
      <button
        onClick={start}
        className="magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        title="Voice to text"
        type="button"
      >
        <Mic className="h-3.5 w-3.5" />
        Voice
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            onClick={cancel}
          >
            <motion.div
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Voice transcription"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className={`relative h-2.5 w-2.5 rounded-full ${listening ? "bg-rose-500" : "bg-muted-foreground"}`}>
                    {listening && (
                      <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-60" />
                    )}
                  </div>
                  <span className="font-sans font-bold text-foreground text-sm">
                    {listening ? "Listening…" : "Voice"}
                  </span>
                </div>
                <button
                  onClick={cancel}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Visualizer */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-end justify-center gap-[3px] h-20" aria-hidden="true">
                  {levels.map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-primary/60 to-primary transition-[height] duration-75"
                      style={{ height: `${Math.max(4, h)}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Live transcript */}
              <div className="px-5 pb-4">
                <div className="min-h-[72px] rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground leading-relaxed">
                  {finalText ? (
                    <span>
                      {finalText}
                      {interim && <span className="text-muted-foreground"> {interim}</span>}
                    </span>
                  ) : interim ? (
                    <span className="text-muted-foreground">{interim}</span>
                  ) : (
                    <span className="text-muted-foreground/70 italic">
                      Start speaking — your words will appear here.
                    </span>
                  )}
                </div>

                {error && (
                  <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={cancel}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={stopAndInsert}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  type="button"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop & Insert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
