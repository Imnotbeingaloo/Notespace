import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SeoHead } from "@/components/SeoHead";
import { NoindexHead } from "@/components/NoindexHead";

interface Stats {
  total: number;
  last30d: number;
  noAttribution: number;
  bySource: Record<string, number>;
  byCampaign: Record<string, number>;
  byLandingPath: Record<string, number>;
  byRef: Record<string, number>;
}

function sortDesc(o: Record<string, number>) {
  return Object.entries(o).sort((a, b) => b[1] - a[1]);
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-48 truncate text-sm text-muted-foreground" title={label}>{label}</div>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-10 text-right text-sm font-mono">{value}</div>
    </div>
  );
}

function Card({ title, data }: { title: string; data: Record<string, number> }) {
  const rows = sortDesc(data).slice(0, 12);
  const max = rows[0]?.[1] ?? 0;
  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <h3 className="font-serif text-lg font-bold mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        rows.map(([k, v]) => <Bar key={k} label={k} value={v} max={max} />)
      )}
    </div>
  );
}

export default function AdminReferrals() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(data));
      if (!data) return;
      const { data: s, error } = await supabase.functions.invoke<Stats>("referral-stats");
      if (error) setErr(error.message);
      else setStats(s ?? null);
    })();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin === false) return <Navigate to="/app" replace />;

  return (
    <>
      <SeoHead title="Referrals" description="Admin signup attribution dashboard." path="/admin/referrals" />
      <NoindexHead />
      <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <p className="text-sm uppercase tracking-widest text-accent font-semibold mb-2">Admin</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Signup Referrals</h1>
            <p className="text-muted-foreground mt-2">
              Where new accounts came from. Captured from <code>?ref</code> and <code>utm_*</code> on first landing.
            </p>
          </header>

          {err && <div className="text-sm text-destructive mb-4">{err}</div>}
          {!stats ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="border border-border rounded-xl p-5 bg-card">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Total signups</p>
                  <p className="font-serif text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="border border-border rounded-xl p-5 bg-card">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Last 30 days</p>
                  <p className="font-serif text-3xl font-bold mt-1">{stats.last30d}</p>
                </div>
                <div className="border border-border rounded-xl p-5 bg-card">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">No attribution</p>
                  <p className="font-serif text-3xl font-bold mt-1">{stats.noAttribution}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card title="By UTM source" data={stats.bySource} />
                <Card title="By campaign" data={stats.byCampaign} />
                <Card title="By landing page" data={stats.byLandingPath} />
                <Card title="By ref tag" data={stats.byRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
