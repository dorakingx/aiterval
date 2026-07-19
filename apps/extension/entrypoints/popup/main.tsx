import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { browser } from "wxt/browser";
import {
  BrandIcon,
  Button,
  ProgressBar,
  Toggle,
  formatDuration,
} from "@aiterval/ui";
import "@aiterval/ui/styles.css";
import { repository } from "../../lib/repository";
import type { StoredData } from "@aiterval/core";
import "./popup.css";
function Popup() {
  const [data, setData] = useState<StoredData>();
  const [host, setHost] = useState("this site");
  useEffect(() => {
    void repository.load().then(setData);
    void browser.tabs
      .query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (tab?.url)
          try {
            setHost(new URL(tab.url).hostname);
          } catch {
            setHost("this site");
          }
      });
  }, []);
  if (!data) return <main>Loading…</main>;
  const today = data.sessions.filter(
    (s) => new Date(s.completedAt).toDateString() === new Date().toDateString(),
  );
  const week = data.sessions.filter(
    (s) => Date.now() - s.completedAt < 7 * 86400000,
  );
  const toggle = async (value: boolean) => {
    const next = { ...data, settings: { ...data.settings, autoStart: value } };
    setData(next);
    await repository.save(next);
  };
  const snooze = async (ms: number) => {
    const next = {
      ...data,
      settings: { ...data.settings, snoozedUntil: Date.now() + ms },
    };
    setData(next);
    await repository.save(next);
  };
  return (
    <main>
      <header>
        <BrandIcon className="mark" />
        <div>
          <strong>AIterval</strong>
          <small>Listen while AI thinks</small>
        </div>
      </header>
      <Button
        onClick={() =>
          void browser.runtime.sendMessage({ type: "AIT_START_ACTIVE" })
        }
      >
        Start a Listening Sprint
      </Button>
      <Toggle
        checked={data.settings.autoStart}
        onChange={(v) => void toggle(v)}
        label="Auto-start"
      />
      <section>
        <span>Today’s recovered time</span>
        <strong>
          {formatDuration(today.reduce((n, s) => n + s.activeSeconds, 0))}
        </strong>
      </section>
      <section>
        <div>
          <span>This week</span>
          <strong>
            {week.length} / {data.settings.weeklyGoal}
          </strong>
        </div>
        <ProgressBar
          value={week.length / data.settings.weeklyGoal}
          label="Weekly progress"
        />
      </section>
      <section className="status">
        <small>Current site</small>
        <strong>{host}</strong>
        <span>
          {host.includes("chatgpt") ||
          host.includes("claude") ||
          host.includes("gemini")
            ? "Detection ready · semantic signals"
            : "Manual sprint available"}
        </span>
      </section>
      <details>
        <summary>Snooze</summary>
        <div className="snooze">
          <button onClick={() => void snooze(1800000)}>30 min</button>
          <button onClick={() => void snooze(3600000)}>1 hour</button>
          <button onClick={() => void snooze(86400000)}>Until tomorrow</button>
        </div>
      </details>
      <Button
        className="secondary"
        onClick={() => void browser.runtime.openOptionsPage()}
      >
        Open Dashboard
      </Button>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Popup />);
