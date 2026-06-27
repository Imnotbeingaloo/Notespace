import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ProfileRow {
  user_id: string;
  display_name: string | null;
  password_last_changed_at: string | null;
}

const DISPLAY_NAME_CACHE_KEY = "displayNameCache";

function readCachedDisplayName(userId: string | undefined): string | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DISPLAY_NAME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user_id?: string; display_name?: string };
    return parsed?.user_id === userId ? (parsed.display_name ?? null) : null;
  } catch {
    return null;
  }
}

function writeCachedDisplayName(userId: string, name: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISPLAY_NAME_CACHE_KEY, JSON.stringify({ user_id: userId, display_name: name }));
    window.dispatchEvent(new CustomEvent("display-name-updated", { detail: { user_id: userId, display_name: name } }));
  } catch {}
}


export function useProfile() {
  const { user } = useAuth();
  // Eagerly seed from localStorage so navigating Home <-> Notebook keeps the
  // greeting stable instead of flashing "Welcome back." then "Welcome back, X.".
  const [profile, setProfile] = useState<ProfileRow | null>(() => {
    if (!user?.id) return null;
    const cached = readCachedDisplayName(user.id);
    return cached !== null
      ? { user_id: user.id, display_name: cached, password_last_changed_at: null }
      : null;
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, password_last_changed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    // Amnesia bug fix: on network/server error, KEEP whatever we have (cache or
    // existing state). Never wipe a known display_name to null just because a
    // slow/failed request returned no data - that re-triggers onboarding.
    if (error) {
      setLoading(false);
      return;
    }
    if (data) {
      const next = data as ProfileRow;
      setProfile(next);
      writeCachedDisplayName(user.id, next.display_name);
    } else {
      // Genuinely no row. Only treat as empty if we don't already have a cached name.
      const cached = readCachedDisplayName(user.id);
      if (cached) {
        setProfile({ user_id: user.id, display_name: cached, password_last_changed_at: null });
      } else {
        setProfile({ user_id: user.id, display_name: null, password_last_changed_at: null });
      }
    }
    setLoading(false);
  }, [user]);


  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cross-instance sync: when any useProfile updates the name, mirror it here.
  useEffect(() => {
    if (!user?.id) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { user_id?: string; display_name?: string | null } | undefined;
      if (!detail || detail.user_id !== user.id) return;
      setProfile((p) => ({
        user_id: user.id,
        display_name: detail.display_name ?? null,
        password_last_changed_at: p?.password_last_changed_at ?? null,
      }));
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key !== DISPLAY_NAME_CACHE_KEY) return;
      const cached = readCachedDisplayName(user.id);
      setProfile((p) => ({
        user_id: user.id,
        display_name: cached,
        password_last_changed_at: p?.password_last_changed_at ?? null,
      }));
    };
    window.addEventListener("display-name-updated", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("display-name-updated", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, [user?.id]);


  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user) return { error: "Not signed in" };
      const trimmed = name.trim().slice(0, 60);
      if (!trimmed) return { error: "Name can't be empty" };
      // Upsert so first-time users without a profile row still work
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, display_name: trimmed }, { onConflict: "user_id" });
      if (error) return { error: error.message };
      setProfile((p) => ({ user_id: user.id, display_name: trimmed, password_last_changed_at: p?.password_last_changed_at ?? null }));
      writeCachedDisplayName(user.id, trimmed);
      return { error: null };
    },
    [user]
  );

  const markPasswordChanged = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    await supabase.from("profiles").upsert(
      { user_id: user.id, password_last_changed_at: now },
      { onConflict: "user_id" }
    );
    setProfile((p) => ({ user_id: user.id, display_name: p?.display_name ?? null, password_last_changed_at: now }));
  }, [user]);

  const daysSincePasswordChange = (() => {
    if (!profile?.password_last_changed_at) return Infinity;
    const ms = Date.now() - new Date(profile.password_last_changed_at).getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  })();

  return { profile, loading, refresh, updateDisplayName, markPasswordChanged, daysSincePasswordChange };
}
