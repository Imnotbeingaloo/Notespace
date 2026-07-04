import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";
const mcpUrl = `https://${projectRef}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-4xl font-serif tracking-tight mb-3">
          Connect Notebook Archive to your AI assistant
        </h1>
        <p className="text-muted-foreground mb-10">
          Give ChatGPT or Claude access to your notebooks and notes. They'll be
          able to read, search, and create notes on your behalf once you sign in.
        </p>

        <Card className="p-5 mb-10 bg-muted/40">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Your MCP server URL
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all bg-background px-3 py-2 rounded border">
              {mcpUrl}
            </code>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? (
                <><Check className="h-4 w-4 mr-1" /> Copied</>
              ) : (
                <><Copy className="h-4 w-4 mr-1" /> Copy</>
              )}
            </Button>
          </div>
        </Card>

        <section className="mb-10">
          <h2 className="text-2xl font-serif mb-4">ChatGPT</h2>
          <ol className="space-y-3 list-decimal list-inside text-sm leading-relaxed">
            <li>
              Open{" "}
              <a
                className="text-primary underline"
                href="https://chatgpt.com/#settings/Connectors/Advanced"
                target="_blank"
                rel="noreferrer"
              >
                ChatGPT Connectors settings
              </a>{" "}
              and enable Developer mode (read the risk notice shown there).
            </li>
            <li>In the chat composer's "+" menu, turn on Developer mode.</li>
            <li>Click "Add sources", then "Connect more".</li>
            <li>Give the connector a name and paste the MCP URL above.</li>
            <li>Sign in with your Notebook Archive account when prompted.</li>
            <li>Ask ChatGPT to search, read, or create notes.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-serif mb-4">Claude</h2>
          <ol className="space-y-3 list-decimal list-inside text-sm leading-relaxed">
            <li>
              Open{" "}
              <a
                className="text-primary underline"
                href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                target="_blank"
                rel="noreferrer"
              >
                Claude's Add custom connector page
              </a>
              .
            </li>
            <li>Give the connector a name and paste the MCP URL above.</li>
            <li>Sign in with your Notebook Archive account when prompted.</li>
            <li>
              Enable the connector from the chat composer, then ask Claude to
              use your notes.
            </li>
          </ol>
        </section>

        <p className="text-xs text-muted-foreground">
          The assistant only sees your notes when you're signed in and grant
          consent. You can revoke access anytime from your assistant's
          connector settings.
        </p>
      </div>
    </main>
  );
}
