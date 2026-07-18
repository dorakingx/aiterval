"use client";
import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import { Button, ListeningPlayer } from "@aiterval/ui";
import { exercises } from "@aiterval/content";
export function Demo({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "generating" | "ready">("idle");
  const [sprint, setSprint] = useState(false);
  useEffect(() => {
    if (state !== "generating") return;
    const overlay = window.setTimeout(() => setSprint(true), 900);
    const done = window.setTimeout(() => setState("ready"), 8500);
    return () => {
      clearTimeout(overlay);
      clearTimeout(done);
    };
  }, [state]);
  const start = () => {
    setState("generating");
    setSprint(false);
  };
  return (
    <div className={`demo-shell ${compact ? "compact" : ""}`}>
      <div className="fake-ai">
        <header>
          <Bot />
          <strong>Research assistant</strong>
          <span className={state} />
        </header>
        <div className="fake-thread">
          <div className="fake-prompt">
            <MessageSquareText />
            <p>Summarize the key trade-offs in this experiment design.</p>
          </div>
          {state === "idle" && (
            <div className="demo-start">
              <Button onClick={start}>Send prompt and try it</Button>
              <small>No login. Audio uses your system voice.</small>
            </div>
          )}
          {state === "generating" && (
            <div className="fake-response">
              <LoaderCircle className="spin" />
              <span>Generating a careful response…</span>
            </div>
          )}
          {state === "ready" && (
            <div className="fake-response ready">
              <CheckCircle2 />
              <span>Your AI response is ready.</span>
            </div>
          )}
        </div>
      </div>
      {sprint && (
        <div className="demo-overlay">
          <ListeningPlayer
            exercise={exercises[18]!}
            initialStage={state === "ready" ? "ai-ready" : "listen"}
            onClose={() => setSprint(false)}
            onSave={() => setSprint(false)}
            onComplete={() => setSprint(false)}
          />
        </div>
      )}
    </div>
  );
}
