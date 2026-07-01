import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X, Loader2, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
  onBeforeOpen?: () => void; // called BEFORE the dialog opens so the caller can snapshot caret
}

type Word = { word: string; start: number; end: number };
type Phase = "idle" | "recording" | "processing" | "review";

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
  const [level, setLevel] = useState(0); // 0-1 running amplitude for the mic pulse

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeDataRef = useRef<Uint8Array | null>(null);
  const levelRef = useRef(0);
  const lastElapsedTickRef = useRef(0);

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

  const startVisualizer = useCallback((stream: MediaStream) => {
    const voiceWindow = window as VoiceWindow;
    const Ctx = voiceWindow.AudioContext || voiceWindow.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048; // time-domain resolution for a smooth wave
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    timeDataRef.current = new Uint8Array(analyser.fftSize);
    startedAtRef.current = performance.now();
    lastElapsedTickRef.current = 0;

    const tick = () => {
      const a = analyserRef.current;
      const data = timeDataRef.current;
      const canvas = canvasRef.current;
      if (!a || !data) return;
      a.getByteTimeDomainData(data);

      // Running RMS for the mic pulse.
      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);
      levelRef.current = levelRef.current * 0.7 + rms * 0.3;

      // Draw waveform to canvas (no React re-render per frame => no jank).
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth;
        const cssH = canvas.clientHeight;
        if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
          canvas.width = Math.max(1, Math.floor(cssW * dpr));
          canvas.height = Math.max(1, Math.floor(cssH * dpr));
        }
        const g = canvas.getContext("2d");
        if (g) {
          const W = canvas.width;
          const H = canvas.height;
          g.clearRect(0, 0, W, H);

          // Gain so quiet speech is visible; clamp so loud spikes don't clip flat.
          const gain = 1.6 + Math.min(1.4, levelRef.current * 4);
          const mid = H / 2;

          // Soft glow trail.
          const grad = g.createLinearGradient(0, 0, W, 0);
          const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "180 60% 40%";
          grad.addColorStop(0, `hsla(${primary}, 0.25)`);
          grad.addColorStop(0.5, `hsla(${primary}, 1)`);
          grad.addColorStop(1, `hsla(${primary}, 0.25)`);
          g.strokeStyle = grad;
          g.lineWidth = Math.max(1.5, 2 * dpr);
          g.lineCap = "round";
          g.lineJoin = "round";

          g.beginPath();
          const step = data.length / W;
          for (let x = 0; x < W; x++) {
            const idx = Math.floor(x * step);
            const v = ((data[idx] - 128) / 128) * gain;
            const y = mid + v * (H * 0.42);
            if (x === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.stroke();

          // Center baseline hint when quiet.
          if (levelRef.current < 0.02) {
            g.strokeStyle = `hsla(${primary}, 0.15)`;
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(0, mid);
            g.lineTo(W, mid);
            g.stroke();
          }
        }
      }

      // Throttle React updates to ~10fps for the pulse + clock (visual only).
      const now = performance.now();
      if (now - lastElapsedTickRef.current > 100) {
        lastElapsedTickRef.current = now;
        setLevel(Math.min(1, levelRef.current * 3));
        setElapsed((now - startedAtRef.current) / 1000);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);


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
    levelRef.current = 0;

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

  const midLevel = useMemo(() => 0.6 + level * 0.6, [level]);

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

              {/* Visualizer (recording / processing) */}
              {phase !== "review" && (
                <div className="px-5 pt-5 pb-2">
                  <div className="relative h-24 rounded-xl bg-muted/40 border border-border/60 overflow-hidden flex items-center justify-center">
                    {/* Mic pulse orb */}
                    <div
                      className="absolute left-4 flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/30 transition-transform duration-75"
                      style={{ transform: `scale(${midLevel})` }}
                    >
                      <Mic className="h-5 w-5 text-primary" />
                    </div>
                    {/* Bars */}
                    <div className="absolute inset-y-0 left-24 right-4 flex items-center gap-[3px]">
                      {bars.map((v, i) => {
                        const h = Math.max(6, Math.min(1, v) * 88);
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-gradient-to-t from-primary/70 to-primary transition-[height,opacity] duration-75"
                            style={{ height: `${h}%`, opacity: 0.55 + v * 0.45 }}
                          />
                        );
                      })}
                    </div>
                    {phase === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/70 backdrop-blur-sm">
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
