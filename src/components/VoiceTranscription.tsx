import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X, Loader2, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
  onBeforeOpen?: () => void; // called BEFORE the dialog opens so the caller can snapshot caret
}

type Word = { word: string; start: number; end: number };
type Phase = "idle" | "recording" | "processing" | "review";

// Centered symmetric bar visualizer driven by FFT frequency data.
// Bars mirror from the center outwards, responding to pitch + amplitude.
const BAR_COUNT = 32;



const fmtTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

type VoiceWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

// Map various failure surfaces to a friendly, actionable string.
const explainError = (raw: unknown, fallback = "Something went wrong. Please try again."): string => {
  // Supabase FunctionsError often stashes JSON body on `context`.
  type MaybeErr = { message?: string; name?: string; context?: unknown; code?: string; error?: string };
  const e = raw as MaybeErr;
  const readCtx = async () => null; // no-op; we use best-effort synchronous shape below
  void readCtx;

  const asObj = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  const ctx = asObj(e?.context);
  const bodyMsg = ctx && typeof ctx.error === "string" ? (ctx.error as string) : undefined;
  const code = ctx && typeof ctx.code === "string" ? (ctx.code as string) : e?.code;
  const msg = bodyMsg || e?.message || (typeof raw === "string" ? raw : "");

  if (code === "unauthorized" || /unauth|401|jwt|sign in/i.test(msg)) {
    return "You've been signed out. Please sign back in and try again.";
  }
  if (code === "stt_timeout" || /timeout|timed out/i.test(msg)) {
    return "Transcription timed out - try a shorter clip.";
  }
  if (code === "stt_rate_limit" || /429|rate.?limit|busy/i.test(msg)) {
    return "Voice service is busy right now. Please try again in a moment.";
  }
  if (code === "stt_too_large" || code === "too_large" || /too large|413/i.test(msg)) {
    return "Recording is too long. Please keep it under about 20 minutes.";
  }
  if (code === "stt_network" || /network|fetch|failed to fetch/i.test(msg)) {
    return "Couldn't reach the voice service. Check your connection and retry.";
  }
  if (code === "stt_auth") {
    return "Voice service authentication failed. Please contact support.";
  }
  if (code === "config") {
    return "Voice service isn't configured. Please contact support.";
  }
  return msg || fallback;
};

export function VoiceTranscription({ onTranscript, onBeforeOpen }: VoiceTranscriptionProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cleaned, setCleaned] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [cleanupNote, setCleanupNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const targetsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const [visualizerReady, setVisualizerReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanupResources = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch { /* ignore */ }
    mediaRecorderRef.current = null;
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

  useEffect(() => () => cleanupResources(), [cleanupResources]);

  const drawBars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const bars = barsRef.current;
    const targets = targetsRef.current;
    const N = bars.length;

    // Ease bars toward their targets. Rising fast (attack), falling slow (release)
    // so brief voice gaps don't collapse the wave - it gently settles instead.
    for (let i = 0; i < N; i++) {
      const rising = targets[i] > bars[i];
      const k = rising ? 0.32 : 0.12;
      bars[i] += (targets[i] - bars[i]) * k;
    }

    const style = getComputedStyle(canvas);
    const fg = style.color || "#111";
    ctx.fillStyle = fg;

    const mid = cssH / 2;
    const gap = 4;
    const barW = Math.max(2, (cssW - gap * (N - 1)) / N);
    const radius = barW / 2;
    const maxAmp = cssH * 0.44;
    const minAmp = 3;

    for (let i = 0; i < N; i++) {
      const x = i * (barW + gap);
      const h = Math.max(minAmp, bars[i] * maxAmp * 2);
      const y = mid - h / 2;
      // rounded rect
      const r = Math.min(radius, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + h - r);
      ctx.quadraticCurveTo(x + barW, y + h, x + barW - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();
    }
  }, []);

  const startVisualizer = useCallback((stream: MediaStream) => {
    const voiceWindow = window as VoiceWindow;
    const Ctx = voiceWindow.AudioContext || voiceWindow.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);

    // Pre-analyser gain boost so quiet voices still register visibly.
    const gain = ctx.createGain();
    gain.gain.value = 1.9; // mic sensitivity

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    // High smoothing keeps the wave fluid across brief pauses / plosives.
    analyser.smoothingTimeConstant = 0.86;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -18;

    source.connect(gain);
    gain.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    const freq = new Uint8Array(analyser.frequencyBinCount);
    startedAtRef.current = performance.now();
    barsRef.current = new Array(BAR_COUNT).fill(0);
    targetsRef.current = new Array(BAR_COUNT).fill(0);
    setVisualizerReady(false);

    // Map FFT bins (skip DC + very high) into BAR_COUNT log-spaced buckets
    // so the visualizer emphasizes vocal range and shows pitch structure.
    const binStart = 2;
    const binEnd = Math.floor(freq.length * 0.75);
    const logMin = Math.log(binStart);
    const logMax = Math.log(binEnd);
    const edges: number[] = [];
    for (let i = 0; i <= BAR_COUNT; i++) {
      edges.push(Math.floor(Math.exp(logMin + ((logMax - logMin) * i) / BAR_COUNT)));
    }

    // Running noise floor + soft compressor so the wave reacts strongly
    // without clipping when loud, and stays lively when quiet.
    let noiseFloor = 0.04;
    let sawAudio = false;

    const tick = () => {
      const a = analyserRef.current;
      if (!a) return;
      a.getByteFrequencyData(freq);
      const targets = targetsRef.current;
      let peak = 0;
      const raw: number[] = new Array(BAR_COUNT);
      for (let b = 0; b < BAR_COUNT; b++) {
        let sum = 0;
        let count = 0;
        for (let j = edges[b]; j < edges[b + 1]; j++) {
          sum += freq[j];
          count++;
        }
        const avg = count ? sum / count / 255 : 0;
        raw[b] = avg;
        if (avg > peak) peak = avg;
      }
      // Adapt noise floor slowly downward, quickly upward on sustained silence.
      noiseFloor += (peak * 0.35 - noiseFloor) * (peak < noiseFloor ? 0.02 : 0.008);
      const floor = Math.min(0.08, noiseFloor);

      for (let b = 0; b < BAR_COUNT; b++) {
        // Subtract noise, boost, soft-knee compress via pow, then clamp.
        let v = Math.max(0, raw[b] - floor) * 1.9;
        v = Math.pow(v, 0.7); // expand dynamic response
        // Soft ceiling to prevent clipping/jitter at loud peaks.
        v = v > 0.9 ? 0.9 + (v - 0.9) * 0.25 : v;
        targets[b] = Math.min(1, v);
      }

      // Reorder so strongest bass reads in the middle -> mirrored highs on sides.
      const ordered = new Array(BAR_COUNT).fill(0);
      const half = Math.floor(BAR_COUNT / 2);
      for (let i = 0; i < half; i++) {
        ordered[half - 1 - i] = targets[i * 2] || 0;
        ordered[half + i] = targets[i * 2 + 1] || 0;
      }
      targetsRef.current = ordered;

      if (!sawAudio && peak > 0.02) {
        sawAudio = true;
        setVisualizerReady(true);
      }
      // Failsafe: reveal after 1.2s even if mic is silent.
      if (!sawAudio && performance.now() - startedAtRef.current > 1200) {
        sawAudio = true;
        setVisualizerReady(true);
      }

      drawBars();
      setElapsed((performance.now() - startedAtRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [drawBars]);




  const pickMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    for (const t of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t)) return t;
    }
    return "";
  };
  const extForMime = (mime: string) => (mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm");

  const start = useCallback(async () => {
    setError(null);
    setCleaned("");
    setWords([]);
    setCleanupNote(null);
    setElapsed(0);
    setLevel(0);
    barsRef.current = new Array(BAR_COUNT).fill(0);
    targetsRef.current = new Array(BAR_COUNT).fill(0);
    setVisualizerReady(false);


    setOpen(true);
    setPhase("recording");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e) {
      const name = (e as Error)?.name;
      setError(
        name === "NotAllowedError"
          ? "Microphone permission was denied. Enable it in your browser and try again."
          : name === "NotFoundError"
          ? "No microphone found. Plug one in and try again."
          : explainError(e, "Could not access the microphone."),
      );
      setPhase("idle");
      return;
    }
    streamRef.current = stream;
    startVisualizer(stream);

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (e) {
      setError(explainError(e, "Recording is not supported in this browser."));
      cleanupResources();
      setPhase("idle");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorderRef.current = recorder;
    recorder.start();
  }, [cleanupResources, startVisualizer]);

  const sendForTranscription = useCallback(async (blob: Blob, mime: string) => {
    setPhase("processing");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("You've been signed out. Please sign back in and try again.");

      const form = new FormData();
      const ext = extForMime(mime);
      form.append("file", blob, `voice.${ext}`);

      const { data, error: fnErr } = await supabase.functions.invoke("voice-transcribe", { body: form });
      if (fnErr) throw fnErr;

      const payload = data as { cleaned?: string; raw?: string; words?: Word[]; cleanup_error?: string } | null;
      const text = (payload?.cleaned || payload?.raw || "").trim();
      if (!text) {
        setError("Nothing was heard - please try again.");
        setPhase("recording");
        return;
      }
      setCleaned(text);
      setWords(Array.isArray(payload?.words) ? payload!.words! : []);
      setCleanupNote(payload?.cleanup_error || null);
      setPhase("review");
    } catch (e) {
      setError(explainError(e, "Transcription failed. Please try again."));
      setPhase("recording");
    }
  }, []);

  const stopAndProcess = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    const durationMs = performance.now() - startedAtRef.current;
    recorder.onstop = () => {
      const mime = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 2048 || durationMs < 400) {
        setError("That recording was too short - try again.");
        setPhase("recording");
        return;
      }
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      sendForTranscription(blob, mime);
    };
    try { recorder.stop(); } catch { /* ignore */ }
  }, [sendForTranscription]);

  const insertAndClose = useCallback(() => {
    if (!cleaned) return;
    onTranscript(cleaned);
    cleanupResources();
    setOpen(false);
    setPhase("idle");
    setCleaned("");
    setWords([]);
    setCleanupNote(null);
  }, [cleaned, cleanupResources, onTranscript]);

  const cancel = useCallback(() => {
    cleanupResources();
    setOpen(false);
    setPhase("idle");
    setCleaned("");
    setWords([]);
    setCleanupNote(null);
    setError(null);
  }, [cleanupResources]);

  // Preserve caret: capture on mousedown BEFORE focus moves to the button.
  const handleTriggerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeOpen?.();
  }, [onBeforeOpen]);

  void level;

  return (
    <>
      <button
        onMouseDown={handleTriggerMouseDown}
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
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            onClick={cancel}
          >
            <motion.div
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Voice transcription"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className={`relative h-2.5 w-2.5 rounded-full ${phase === "recording" ? "bg-rose-500" : phase === "processing" ? "bg-amber-500" : phase === "review" ? "bg-emerald-500" : "bg-muted-foreground"}`}>
                    {phase === "recording" && <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-60" />}
                  </div>
                  <span className="font-sans font-bold text-foreground text-sm">
                    {phase === "recording" ? "Listening…" : phase === "processing" ? "Transcribing…" : phase === "review" ? "Review transcript" : "Voice"}
                  </span>
                  {phase === "recording" && (
                    <span className="ml-2 text-[11px] tabular-nums text-muted-foreground">{fmtTime(elapsed)}</span>
                  )}
                </div>
                <button onClick={cancel} className="p-1 rounded-md hover:bg-muted text-muted-foreground" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Centered symmetric bar visualizer - responds to voice pitch & amplitude */}
              {phase !== "review" && (
                <div className="px-6 pt-8 pb-6">
                  <div className="relative h-24">
                    <canvas
                      ref={canvasRef}
                      className={`w-full h-full block text-foreground/90 transition-opacity duration-300 ${visualizerReady && phase === "recording" ? "opacity-100" : "opacity-0"}`}
                      aria-hidden="true"
                    />
                    {phase === "recording" && !visualizerReady && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Warming up mic…
                        </span>
                      </div>
                    )}
                    {phase === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cleaning up your transcript…
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* Review panel with timestamps */}
              {phase === "review" && (
                <div className="px-5 pt-4 pb-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transcript</span>
                    {words.length > 0 && (
                      <button
                        onClick={() => setShowTimestamps((v) => !v)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        type="button"
                      >
                        <Clock className="h-3 w-3" />
                        {showTimestamps ? "Hide timestamps" : "Show word timestamps"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[240px] overflow-auto rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground leading-relaxed">
                    {showTimestamps && words.length > 0 ? (
                      <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                        {words.map((w, i) => (
                          <span key={i} className="group relative inline-flex items-baseline">
                            <span
                              className="absolute -top-4 left-0 text-[9px] font-mono text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                              aria-hidden="true"
                            >
                              {fmtTime(w.start)}
                            </span>
                            <span className="px-1 rounded hover:bg-primary/10">{w.word}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{cleaned}</p>
                    )}
                  </div>
                  {cleanupNote && (
                    <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400">
                      <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{cleanupNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Recording hint */}
              {phase === "recording" && !error && (
                <div className="px-5 pb-3">
                  <p className="text-[12px] text-muted-foreground/80 italic">Speak clearly - hit Stop when you're done.</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mx-5 mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div>{error}</div>
                    {phase !== "processing" && (
                      <button
                        onClick={() => { setError(null); if (phase === "idle") start(); }}
                        className="mt-1 underline underline-offset-2 hover:opacity-80"
                        type="button"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border bg-muted/30">
                <button
                  onClick={cancel}
                  className="px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                {phase === "review" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setCleaned(""); setWords([]); setCleanupNote(null); start(); }}
                      className="px-3 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                      type="button"
                    >
                      Re-record
                    </button>
                    <button
                      onClick={insertAndClose}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      type="button"
                    >
                      Insert at cursor
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={stopAndProcess}
                    disabled={phase !== "recording"}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {phase === "processing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5 fill-current" />}
                    Stop & Transcribe
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
