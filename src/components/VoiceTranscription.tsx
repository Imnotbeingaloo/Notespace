import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X } from "lucide-react";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
}

/**
 * Voice → text with a live popup.
 * The waveform is updated imperatively via refs (no React state in the RAF loop)
 * so the visualizer stays smooth even while speech recognition is firing.
 */
const POINT_COUNT = 56;
const W = 320;
const H = 80;
const MID = H / 2;
const STEP_X = W / (POINT_COUNT - 1);

export function VoiceTranscription({ onTranscript }: VoiceTranscriptionProps) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const listeningRef = useRef(false);
  const aggregateRef = useRef("");
  const smoothedRef = useRef<number[]>(new Array(POINT_COUNT).fill(0));
  const restartTimerRef = useRef<number | null>(null);
  const topPathRef = useRef<SVGPathElement | null>(null);
  const botPathRef = useRef<SVGPathElement | null>(null);
  const fillPathRef = useRef<SVGPathElement | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const cleanup = useCallback(() => {
    listeningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
    try { recognitionRef.current?.abort(); } catch {}
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
    smoothedRef.current = new Array(POINT_COUNT).fill(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const buildStrokePath = (vals: number[], topSide: boolean) => {
    const pts: [number, number][] = vals.map((v, i) => {
      const amp = Math.max(1.5, Math.min(1, v) * (H / 2 - 6));
      return [i * STEP_X, topSide ? MID - amp : MID + amp];
    });
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` Q ${x0} ${y0} ${mx} ${(y0 + y1) / 2}`;
    }
    const last = pts[pts.length - 1];
    d += ` T ${last[0]} ${last[1]}`;
    return d;
  };

  const buildFillPath = (vals: number[]) => {
    const top = vals.map((v, i): [number, number] => [
      i * STEP_X,
      MID - Math.max(1.5, Math.min(1, v) * (H / 2 - 6)),
    ]);
    const bottom = vals.map((v, i): [number, number] => [
      i * STEP_X,
      MID + Math.max(1.5, Math.min(1, v) * (H / 2 - 6)),
    ]);

    let d = `M ${top[0][0]} ${top[0][1]}`;
    for (let i = 1; i < top.length; i++) {
      const [x0, y0] = top[i - 1];
      const [x1, y1] = top[i];
      d += ` Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
    }
    d += ` T ${top[top.length - 1][0]} ${top[top.length - 1][1]}`;
    for (let i = bottom.length - 1; i > 0; i--) {
      const [x0, y0] = bottom[i];
      const [x1, y1] = bottom[i - 1];
      d += ` Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
    }
    d += ` T ${bottom[0][0]} ${bottom[0][1]} Z`;
    return d;
  };

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

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(data);
        const step = data.length / POINT_COUNT;
        const next = smoothedRef.current;
        for (let i = 0; i < POINT_COUNT; i++) {
          const start = Math.floor(i * step);
          const end = Math.max(start + 1, Math.floor((i + 1) * step));
          let peak = 0;
          let sumSquares = 0;
          for (let j = start; j < end; j++) {
            const sample = Math.abs(data[j] - 128) / 128;
            peak = Math.max(peak, sample);
            sumSquares += sample * sample;
          }
          const rms = Math.sqrt(sumSquares / (end - start));
          const target = Math.min(1, Math.max(peak * 0.72, rms * 1.9));
          next[i] = next[i] * 0.78 + target * 0.22;
        }
        const topD = buildStrokePath(next, true);
        const botD = buildStrokePath(next, false);
        if (topPathRef.current) topPathRef.current.setAttribute("d", topD);
        if (botPathRef.current) botPathRef.current.setAttribute("d", botD);
        if (fillPathRef.current) fillPathRef.current.setAttribute("d", buildFillPath(next));
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
    recognition.lang = navigator.language?.startsWith("en") ? navigator.language : "en-US";

    recognition.onresult = (event: any) => {
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const alternatives = Array.from({ length: res.length }, (_, index) => res[index]);
        const best = alternatives.reduce<any>((winner, current: any) => {
          if (!winner) return current;
          return (current?.confidence ?? 0) > (winner?.confidence ?? 0) ? current : winner;
        }, null);
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
      setInterim(interimChunk);
    };
    recognition.onerror = (e: any) => {
      const err = e?.error;
      if (err === "no-speech" || err === "aborted" || err === "audio-capture") return;
      if (err === "not-allowed" || err === "service-not-allowed") {
        setError("Microphone permission denied. Allow mic access and try again.");
        listeningRef.current = false;
        setListening(false);
      } else if (err) {
        setError(`Recognition error: ${err}`);
      }
    };
    recognition.onend = () => {
      if (listeningRef.current) {
        restartTimerRef.current = window.setTimeout(() => {
          if (!listeningRef.current) return;
          try { recognition.start(); } catch {}
        }, 180);
      }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e: any) {
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
    const text = (aggregateRef.current + (interim ? " " + interim : "")).trim();
    cleanup();
    if (text) onTranscript(text);
    setOpen(false);
    setInterim("");
    setFinalText("");
    aggregateRef.current = "";
  }, [interim, cleanup, onTranscript]);

  const cancel = useCallback(() => {
    setListening(false);
    listeningRef.current = false;
    cleanup();
    setOpen(false);
    setInterim("");
    setFinalText("");
    aggregateRef.current = "";
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

              {/* Smooth waveform visualizer (imperative SVG updates) */}
              <div className="px-5 pt-5 pb-3">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  className="w-full h-20"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="vt-wave-grad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0" x2={W} y1={MID} y2={MID}
                    stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 4"
                  />
                  <path ref={fillPathRef} d="" fill="url(#vt-wave-grad)" opacity="0.55" />
                  <path
                    ref={topPathRef}
                    d=""
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    ref={botPathRef}
                    d=""
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
