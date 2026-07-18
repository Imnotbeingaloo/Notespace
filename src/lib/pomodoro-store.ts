// Global Pomodoro store so the timer keeps running while the user navigates
// between the editor, the dedicated /app/pomodoro page, and the compact pill
// in the header. State is held at module scope with a tiny pub/sub layer.

import { useEffect, useSyncExternalStore } from "react";

export type PomodoroPhase = "work" | "break" | "longBreak";

export const POMODORO_PHASE_CONFIG: Record<
  PomodoroPhase,
  { duration: number; label: string }
> = {
  work: { duration: 25 * 60, label: "Focus" },
  break: { duration: 5 * 60, label: "Short Break" },
  longBreak: { duration: 15 * 60, label: "Long Break" },
};

interface PomodoroState {
  phase: PomodoroPhase;
  timeLeft: number;
  running: boolean;
  sessions: number;
  /** Timestamp (ms) when the current run started; null if not running. */
  runStartedAt: number | null;
  /** Snapshot of timeLeft when the run started, for drift-free ticking. */
  runStartedTimeLeft: number;
}

let state: PomodoroState = {
  phase: "work",
  timeLeft: POMODORO_PHASE_CONFIG.work.duration,
  running: false,
  sessions: 0,
  runStartedAt: null,
  runStartedTimeLeft: POMODORO_PHASE_CONFIG.work.duration,
};

const listeners = new Set<() => void>();
let tickHandle: ReturnType<typeof setInterval> | null = null;
let onPhaseComplete: ((finished: PomodoroPhase, sessions: number) => void) | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function currentTimeLeft(): number {
  if (!state.running || state.runStartedAt == null) return state.timeLeft;
  const elapsed = Math.floor((Date.now() - state.runStartedAt) / 1000);
  return Math.max(0, state.runStartedTimeLeft - elapsed);
}

function ensureTicker() {
  if (tickHandle || !state.running) return;
  tickHandle = setInterval(() => {
    const next = currentTimeLeft();
    if (next !== state.timeLeft) {
      state = { ...state, timeLeft: next };
      emit();
    }
    if (next <= 0) {
      completePhase();
    }
  }, 500);
}

function stopTicker() {
  if (tickHandle) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

function completePhase() {
  const finished = state.phase;
  stopTicker();
  let nextPhase: PomodoroPhase;
  let sessions = state.sessions;
  if (finished === "work") {
    sessions += 1;
    nextPhase = sessions % 4 === 0 ? "longBreak" : "break";
  } else {
    nextPhase = "work";
  }
  const duration = POMODORO_PHASE_CONFIG[nextPhase].duration;
  state = {
    phase: nextPhase,
    timeLeft: duration,
    running: false,
    sessions,
    runStartedAt: null,
    runStartedTimeLeft: duration,
  };
  emit();
  onPhaseComplete?.(finished, sessions);
}

export const pomodoroStore = {
  get(): PomodoroState {
    return state;
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  start() {
    if (state.running) return;
    state = {
      ...state,
      running: true,
      runStartedAt: Date.now(),
      runStartedTimeLeft: state.timeLeft,
    };
    emit();
    ensureTicker();
  },
  pause() {
    if (!state.running) return;
    const timeLeft = currentTimeLeft();
    stopTicker();
    state = { ...state, running: false, timeLeft, runStartedAt: null, runStartedTimeLeft: timeLeft };
    emit();
  },
  toggle() {
    if (state.running) this.pause();
    else this.start();
  },
  reset() {
    stopTicker();
    const duration = POMODORO_PHASE_CONFIG[state.phase].duration;
    state = {
      ...state,
      running: false,
      timeLeft: duration,
      runStartedAt: null,
      runStartedTimeLeft: duration,
    };
    emit();
  },
  switchPhase(phase: PomodoroPhase) {
    stopTicker();
    const duration = POMODORO_PHASE_CONFIG[phase].duration;
    state = {
      ...state,
      phase,
      running: false,
      timeLeft: duration,
      runStartedAt: null,
      runStartedTimeLeft: duration,
    };
    emit();
  },
  setOnPhaseComplete(fn: ((finished: PomodoroPhase, sessions: number) => void) | null) {
    onPhaseComplete = fn;
  },
};

export function usePomodoro() {
  const snap = useSyncExternalStore(
    pomodoroStore.subscribe,
    pomodoroStore.get,
    pomodoroStore.get
  );
  // Keep ticking if a run is active (e.g. after remount).
  useEffect(() => {
    if (snap.running) ensureTicker();
  }, [snap.running]);
  return snap;
}

export function formatPomodoro(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
