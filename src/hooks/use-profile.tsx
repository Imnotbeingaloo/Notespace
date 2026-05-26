import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ProfileRow {
  user_id: string;
  display_name: string | null;
  password_last_changed_at: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, password_last_changed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile((data as ProfileRow) ?? { user_id: user.id, display_name: null, password_last_changed_at: null });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
