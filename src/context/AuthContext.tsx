import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_HINT_KEY = "na_has_session";

/** True if a session was active on the previous visit; used to render the
 * authenticated CTA optimistically and avoid a logged-out → logged-in flicker. */
export function hasLikelySession(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(SESSION_HINT_KEY) === "1"; } catch { return false; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const applySession = (nextSession: Session | null) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      const nextId = nextUser?.id ?? null;
      // Persist a non-sensitive hint so the next cold load can render the
      // authenticated CTA without waiting on getSession().
      try {
        if (nextId) localStorage.setItem(SESSION_HINT_KEY, "1");
        else localStorage.removeItem(SESSION_HINT_KEY);
      } catch {}
      if (nextId !== currentUserIdRef.current) {
        currentUserIdRef.current = nextId;
        setUser(nextUser);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      applySession(initial);
    });

    return () => subscription.unsubscribe();
  }, []);


  const signUp = async (email: string, password: string, displayName?: string) => {
    let referral: unknown = null;
    try {
      const raw = localStorage.getItem("na_referral");
      if (raw) referral = JSON.parse(raw);
    } catch { /* ignore */ }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verified`,
        data: { display_name: displayName, ...(referral ? { referral } : {}) },
      },
    });
    return { error: error as Error | null };
  };


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
