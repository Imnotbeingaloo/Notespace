import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface VoiceTranscriptionProps {
  onTranscript: (text: string) => void;
}

export function VoiceTranscription({ onTranscript }: VoiceTranscriptionProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        onTranscript(last[0].transcript);
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onTranscript]);

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`magnetic-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200 ${
        listening
          ? "bg-destructive/10 text-destructive border border-destructive/30 animate-pulse-glow"
          : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      title={listening ? "Stop recording" : "Voice to text"}
    >
      <AnimatePresence mode="wait">
        {listening ? (
          <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <MicOff className="h-3.5 w-3.5" />
          </motion.div>
        ) : (
          <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Mic className="h-3.5 w-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
      {listening ? "Stop" : "Voice"}
      {!isPro && !listening && <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
    </button>
  );
}
