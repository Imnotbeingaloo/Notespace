import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

/**
 * Landing page for the email-verification link.
 *
 * - Broadcasts `verified` on the `na-auth` channel. If another tab (the
 *   original sign-up tab) is open and acks, we show a "return to your other
 *   tab" message and stay put. The other tab takes over to /home?welcome=1.
 * - If no ack arrives in ~700ms, this tab self-redirects to /home?welcome=1
 *   so the user always lands on onboarding.
 */
export default function Verified() {
  const navigate = useNavigate();
  const [handedOff, setHandedOff] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      navigate("/home?welcome=1", { replace: true });
      return;
    }
    const ch = new BroadcastChannel("na-auth");
    let acked = false;
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "awaiting-ack" || e.data?.type === "awaiting") {
        acked = true;
        setHandedOff(true);
      }
    };
    ch.addEventListener("message", onMsg);
    ch.postMessage({ type: "verified" });
    const t = setTimeout(() => {
      if (!acked) navigate("/home?welcome=1", { replace: true });
    }, 700);
    return () => {
      clearTimeout(t);
      ch.removeEventListener("message", onMsg);
      ch.close();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden relative">
      {/* Ambient animated orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-verified-float-a" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl animate-verified-float-b" />
      </div>

      <div className="w-full max-w-md text-center animate-verified-rise">
        {/* Check mark with expanding rings */}
        <div className="relative mx-auto mb-8 h-28 w-28">
          <span className="absolute inset-0 rounded-full bg-emerald-500/15 animate-verified-ring" />
          <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-verified-ring-delayed" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-verified-pop">
              <CheckCircle2 className="h-12 w-12 animate-verified-tick" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground animate-verified-rise-delayed">
          Email verified
        </h1>

        {handedOff ? (
          <p className="mt-3 text-muted-foreground animate-fade-in">
            You can close this tab and return to your other window - we've picked up where you left off.
          </p>
        ) : (
          <p className="mt-3 text-muted-foreground animate-fade-in">
            Taking you to your workspace...
          </p>
        )}

        {/* Indeterminate progress bar */}
        <div className="mt-8 mx-auto h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary animate-verified-bar" />
        </div>
      </div>
    </div>
  );
}
