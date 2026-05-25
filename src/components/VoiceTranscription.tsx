import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X } from "lucide-react";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
}

/**
 * Voice → text with a live popup:
 *  - Smooth mirrored waveform driven by the mic input level
 *  - Live interim transcript visible while speaking
 *  - On Stop, the full transcript is sent back via onTranscript
 *    so the editor can insert it at the last cursor position.
 */
const SAMPLE_COUNT = 48;

export function VoiceTranscription({ onTranscript }: VoiceTranscriptionProps) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(() => new Array(SAMPLE_COUNT).fill(0));

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const listeningRef = useRef(false);
  const aggregateRef = useRef("");
  const interimRef = useRef("");
  const smoothedRef = useRef<number[]>(new Array(SAMPLE_COUNT).fill(0));
  const lastPaintRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const cleanup = useCallback(() => {
    listeningRef.current = false;
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
    smoothedRef.current = new Array(SAMPLE_COUNT).fill(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const Ctx: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.9;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.fftSize);

      const tick = (time = 0) => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(data);
        const step = data.length / SAMPLE_COUNT;
        const next = smoothedRef.current.slice();
        for (let i = 0; i < SAMPLE_COUNT; i++) {
          const start = Math.floor(i * step);
          const end = Math.floor((i + 1) * step) || start + 1;
          let sum = 0;
          for (let j = start; j < end; j++) {
            const centered = (data[j] - 128) / 128;
            sum += Math.abs(centered);
          }
          const avg = Math.min(1, sum / (end - start) * 2.6);
          next[i] = next[i] * 0.78 + avg * 0.22;
        }
        smoothedRef.current = next;
        if (time - lastPaintRef.current > 32) {
          lastPaintRef.current = time;
          setLevels(next);
        }
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
    aggregateRef.current = "";
    interimRef.current = "";
    setOpen(true);
    setListening(true);
    listeningRef.current = true;
    await startVisualizer();

    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      setListening(false);
      listeningRef.current = false;
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const best = Array.from(res as SpeechRecognitionResult).sort((a: any, b: any) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] as SpeechRecognitionAlternative | undefined;
        const txt = best?.transcript ?? res[0]?.transcript ?? "";
        if (res.isFinal) {
          const trimmed = txt.trim();
          if (trimmed) {
            aggregateRef.current +=
              (aggregateRef.current && !aggregateRef.current.endsWith(" ") ? " " : "") + trimmed;
          }
        } else {
          interimChunk += txt;
        }
      }
      setFinalText(aggregateRef.current);
      interimRef.current = interimChunk;
      setInterim(interimChunk);
    };
    recognition.onerror = (e: any) => {
      const err = e?.error;
      if (err === "no-speech" || err === "aborted") return;
      if (err === "not-allowed" || err === "service-not-allowed") {
        setError("Microphone permission denied. Allow mic access and try again.");
        listeningRef.current = false;
        setListening(false);
      } else if (err) {
        setError(`Recognition error: ${err}`);
      }
    };
    recognition.onend = () => {
      // Chrome ends after ~60s or on brief silence — restart while user is still listening
      if (listeningRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e: any) {
      // Some browsers throw if start() is called twice quickly
      if (!String(e?.message || "").includes("already started")) {
        setError(e?.message || "Could not start recognition.");
        setListening(false);
        listeningRef.current = false;
      }
    }
  }, [startVisualizer]);

  const stopAndInsert = useCallback(() => {
    setListening(false);
    listeningRef.current = false;
    const text = (aggregateRef.current + (interimRef.current ? " " + interimRef.current : "")).trim();
    cleanup();
    if (text) onTranscript(text);
    setOpen(false);
    setInterim("");
    setFinalText("");
    aggregateRef.current = "";
    interimRef.current = "";
  }, [cleanup, onTranscript]);

  const cancel = useCallback(() => {
    setListening(false);
    listeningRef.current = false;
    cleanup();
    setOpen(false);
    setInterim("");
    setFinalText("");
    aggregateRef.current = "";
    interimRef.current = "";
  }, [cleanup]);

  if (!isSupported) return null;

  // Build smooth waveform SVG path (mirrored top/bottom around centerline)
  const W = 320;
  const H = 80;
  const mid = H / 2;
  const stepX = W / (SAMPLE_COUNT - 1);
  const amp = (v: number, i: number) => {
    const edgeFade = Math.sin((i / (SAMPLE_COUNT - 1)) * Math.PI);
    return Math.max(2, v * edgeFade * (H / 2 - 5));
  };
  const topPts = levels.map((v, i) => [i * stepX, mid - amp(v, i)] as const);
  const botPts = levels.map((v, i) => [i * stepX, mid + amp(v, i)] as const);
  const toPath = (pts: readonly (readonly [number, number])[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` Q ${cx} ${y0} ${cx} ${(y0 + y1) / 2} T ${x1} ${y1}`;
    }
    return d;
  };
  const reversedBot = [...botPts].reverse();
  const fillPath = `${toPath(topPts)} L ${reversedBot[0][0]} ${reversedBot[0][1]} ${toPath(reversedBot).replace(/^M\s[^Q]+/, "")} Z`;

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

              {/* Smooth waveform visualizer */}
              <div className="px-5 pt-5 pb-3">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  className="w-full h-20"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="vt-wave-grad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0" x2={W} y1={mid} y2={mid}
                    stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 4"
                  />
                  <path d={fillPath} fill="url(#vt-wave-grad)" opacity="0.55" />
                  <path
                    d={toPath(topPts)}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={toPath(botPts)}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
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
