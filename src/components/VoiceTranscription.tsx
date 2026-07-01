import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AlertTriangle, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
}

const POINT_COUNT = 72;
const W = 320;
const H = 80;
const MID = H / 2;
const STEP_X = W / POINT_COUNT;
const BAR_WIDTH = Math.max(1.2, STEP_X * 0.42);

type VoiceWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/**
 * Voice → text via Groq Whisper (transcription) + Groq Llama (cleanup).
 * Records mic audio with MediaRecorder, uploads to the `voice-transcribe`
 * edge function, and returns the cleaned transcript. Works in every modern
 * browser (Chrome, Safari, Firefox, mobile) - no reliance on the flaky
 * webkitSpeechRecognition API.
 */
export function VoiceTranscription({ onTranscript }: VoiceTranscriptionProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "recording" | "processing">("idle");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleRafRef = useRef<number | null>(null);
  const smoothedRef = useRef<number[]>(new Array(POINT_COUNT).fill(0));
  const barsPathRef = useRef<SVGPathElement | null>(null);
  const startedAtRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    idleRafRef.current = null;
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
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
    smoothedRef.current = new Array(POINT_COUNT).fill(0);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const buildBarsPath = (vals: number[]) => {
    const minHalf = 1.2;
    const maxHalf = H / 2 - 4;
    let d = "";
    for (let i = 0; i < vals.length; i++) {
      const x = (i + 0.5) * STEP_X;
      const half = Math.max(minHalf, Math.min(1, vals[i]) * maxHalf);
      d += `M ${x.toFixed(2)} ${(MID - half).toFixed(2)} L ${x.toFixed(2)} ${(MID + half).toFixed(2)} `;
    }
    return d;
  };

  const setBarsPath = useCallback((el: SVGPathElement | null) => {
    barsPathRef.current = el;
    if (el) el.setAttribute("d", buildBarsPath(smoothedRef.current));
  }, []);

  const startIdleAnimation = useCallback(() => {
    if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    const startTs = performance.now();
    const idleTick = (now: number) => {
      if (analyserRef.current) { idleRafRef.current = null; return; }
      const t = (now - startTs) / 1000;
      const next = smoothedRef.current;
      for (let i = 0; i < POINT_COUNT; i++) {
        const phase = (i / POINT_COUNT) * Math.PI * 2;
        const v = 0.08 + 0.05 * Math.sin(t * 3 + phase) + 0.04 * Math.sin(t * 5 + phase * 1.7);
        next[i] = Math.max(0.02, v);
      }
      if (barsPathRef.current) barsPathRef.current.setAttribute("d", buildBarsPath(next));
      idleRafRef.current = requestAnimationFrame(idleTick);
    };
    idleRafRef.current = requestAnimationFrame(idleTick);
  }, []);

  const startVisualizer = useCallback((stream: MediaStream) => {
    const voiceWindow = window as VoiceWindow;
    const Ctx = voiceWindow.AudioContext || voiceWindow.webkitAudioContext;
    if (!Ctx) return;
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
        let peak = 0, sumSquares = 0;
        for (let j = start; j < end; j++) {
          const sample = Math.abs(data[j] - 128) / 128;
          peak = Math.max(peak, sample);
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / (end - start));
        const target = Math.min(1, Math.max(peak * 0.72, rms * 1.9));
        next[i] = next[i] * 0.78 + target * 0.22;
      }
      if (barsPathRef.current) barsPathRef.current.setAttribute("d", buildBarsPath(next));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Pick a MediaRecorder mimeType Groq Whisper accepts.
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

  const extForMime = (mime: string) => {
    if (mime.includes("mp4")) return "m4a";
    if (mime.includes("ogg")) return "ogg";
    return "webm";
  };

  const start = useCallback(async () => {
    setError(null);
    setPreview("");
    setOpen(true);
    setPhase("recording");
    startIdleAnimation();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Microphone access denied."));
      setPhase("idle");
      return;
    }
    streamRef.current = stream;
    startVisualizer(stream);

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Recording not supported in this browser."));
      cleanup();
      setPhase("idle");
      return;
    }
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
    mediaRecorderRef.current = recorder;
    startedAtRef.current = performance.now();
    // No timeslice - single self-contained container at stop().
    recorder.start();
  }, [cleanup, startIdleAnimation, startVisualizer]);

  const sendForTranscription = useCallback(async (blob: Blob, mime: string) => {
    setPhase("processing");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in to use voice transcription.");

      const form = new FormData();
      const ext = extForMime(mime);
      form.append("file", blob, `voice.${ext}`);

      const { data, error } = await supabase.functions.invoke("voice-transcribe", { body: form });
      if (error) throw error;
      const cleaned = ((data as { cleaned?: string; raw?: string })?.cleaned || (data as { raw?: string })?.raw || "").trim();
      if (!cleaned) {
        setError("Nothing was transcribed - please try again.");
        setPhase("recording");
        return;
      }
      setPreview(cleaned);
      onTranscript(cleaned);
      cleanup();
      setOpen(false);
      setPhase("idle");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Transcription failed."));
      setPhase("recording");
    }
  }, [cleanup, onTranscript]);

  const stopAndInsert = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    const durationMs = performance.now() - startedAtRef.current;
    recorder.onstop = () => {
      const mime = recorder.mimeType || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      // Guard: <400 ms or <2 KB blobs are typically empty/silent captures.
      if (blob.size < 2048 || durationMs < 400) {
        setError("That recording was too short - try again.");
        setPhase("recording");
        return;
      }
      // Stop the mic + visualizer immediately; keep the dialog for the processing spinner.
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      sendForTranscription(blob, mime);
    };
    try { recorder.stop(); } catch {}
  }, [sendForTranscription]);

  const cancel = useCallback(() => {
    cleanup();
    setOpen(false);
    setPhase("idle");
    setPreview("");
  }, [cleanup]);

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
                  <div className={`relative h-2.5 w-2.5 rounded-full ${phase === "recording" ? "bg-rose-500" : "bg-muted-foreground"}`}>
                    {phase === "recording" && (
                      <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-60" />
                    )}
                  </div>
                  <span className="font-sans font-bold text-foreground text-sm">
                    {phase === "recording" ? "Listening…" : phase === "processing" ? "Transcribing…" : "Voice"}
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

              <div className="px-5 pt-5 pb-3">
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="none"
                  className="w-full h-20"
                  aria-hidden="true"
                >
                  <path
                    ref={setBarsPath}
                    d={buildBarsPath(smoothedRef.current)}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={BAR_WIDTH}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="px-5 pb-4">
                <div className="min-h-[72px] rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground leading-relaxed flex items-center">
                  {phase === "processing" ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cleaning up your transcript…
                    </span>
                  ) : preview ? (
                    <span>{preview}</span>
                  ) : (
                    <span className="text-muted-foreground/70 italic">
                      Start speaking - hit Stop when you're done.
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
                  disabled={phase !== "recording"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {phase === "processing" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Square className="h-3.5 w-3.5 fill-current" />
                  )}
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
