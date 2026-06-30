import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { NoindexHead } from "@/components/NoindexHead";
import { SeoHead } from "@/components/SeoHead";

interface FailureRow {
  id: string;
  email: string;
  reason: string;
  user_agent: string | null;
  created_at: string;
}

const RANGES: Record<string, number> = {
  "Last 15 min": 15,
  "Last hour": 60,
  "Last 24 hours": 60 * 24,
  "Last 7 days": 60 * 24 * 7,
};

const REASON_LABEL: Record<string, string> = {
  wrong_password: "Wrong password",
  email_not_found: "Unknown email",
  signup_attempt: "Signup attempt",
  reset_attempt: "Password reset",
};

export default function AdminAuthLogs() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<FailureRow[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [rangeLabel, setRangeLabel] = useState("Last 24 hours");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin" as never,
      });
      if (error) { setIsAdmin(false); return; }
      setIsAdmin(Boolean(data));
    })();
  }, [user]);

  const load = useMemo(() => async () => {
    if (!isAdmin) return;
    setLoading(true);
    setErr(null);
    try {
      const sinceMin = RANGES[rangeLabel] ?? 60 * 24;
      const sinceIso = new Date(Date.now() - sinceMin * 60 * 1000).toISOString();
      let q = supabase
        .from("auth_failure_logs")
        .select("id,email,reason,user_agent,created_at")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(500);
      if (emailFilter.trim()) q = q.ilike("email", `%${emailFilter.trim().toLowerCase()}%`);
      if (reasonFilter !== "all") q = q.eq("reason", reasonFilter);
      const { data, error } = await q;
      if (error) throw error;
      setRows((data as FailureRow[]) ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, emailFilter, rangeLabel, reasonFilter]);

  useEffect(() => { load(); }, [load]);

  // Group by email so admins can see who is being hammered.
  const summary = useMemo(() => {
    const byEmail = new Map<string, number>();
    for (const r of rows) byEmail.set(r.email, (byEmail.get(r.email) ?? 0) + 1);
    return Array.from(byEmail.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [rows]);

  if (authLoading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <NoindexHead />
      <SeoHead title="Auth logs · Admin" description="Internal admin dashboard for authentication failure logs." path="/admin/auth-logs" />
      <main className="min-h-screen bg-background text-foreground px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6">
            <h1 className="font-serif text-3xl font-bold">Auth failure logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rate-limited attempts and credential failures across login, signup, and password reset.
            </p>
          </header>

          <section className="border border-border rounded-xl p-4 bg-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">Email contains</span>
                <input
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  placeholder="user@example.com"
                  className="border border-border rounded-lg px-3 py-2 bg-background"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">Time range</span>
                <select
                  value={rangeLabel}
                  onChange={(e) => setRangeLabel(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 bg-background"
                >
                  {Object.keys(RANGES).map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">Reason</span>
                <select
                  value={reasonFilter}
                  onChange={(e) => setReasonFilter(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 bg-background"
                >
                  <option value="all">All</option>
                  {Object.entries(REASON_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <button
                onClick={load}
                disabled={loading}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </section>

          {err && <p className="text-sm text-destructive mb-4">{err}</p>}

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 border border-border rounded-xl p-4 bg-card">
              <h3 className="font-serif text-lg font-bold mb-3">Top emails ({rows.length} events)</h3>
              {summary.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data in this window.</p>
              ) : (
                <ul className="space-y-1.5">
                  {summary.map(([email, n]) => {
                    const limited = n >= 5;
                    return (
                      <li key={email} className="flex items-center justify-between text-sm">
                        <button
                          className="truncate text-left hover:underline"
                          onClick={() => setEmailFilter(email)}
                          title={email}
                        >
                          {email}
                        </button>
                        <span className={`font-mono text-xs px-2 py-0.5 rounded ${limited ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                          {n}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden">
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">When</th>
                      <th className="text-left px-3 py-2 font-medium">Email</th>
                      <th className="text-left px-3 py-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">No events.</td></tr>
                    )}
                    {rows.map((r) => (
                      <tr key={r.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 truncate max-w-[200px]" title={r.email}>{r.email}</td>
                        <td className="px-3 py-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted">{REASON_LABEL[r.reason] ?? r.reason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
