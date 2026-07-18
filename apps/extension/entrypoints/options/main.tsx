import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Download,
  Headphones,
  RotateCcw,
  Settings as SettingsIcon,
  Target,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ListeningMap,
  Modal,
  ProgressBar,
  Select,
  Slider,
  StatCard,
  Toggle,
  formatDuration,
} from "@aiterval/ui";
import "@aiterval/ui/styles.css";
import {
  defaultSettings,
  importData,
  type Settings,
  type StoredData,
} from "@aiterval/core";
import { exercises } from "@aiterval/content";
import { repository } from "../../lib/repository";
import "./options.css";
function Dashboard() {
  const [data, setData] = useState<StoredData>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    void repository.load().then(setData);
  }, []);
  const week = useMemo(
    () =>
      data?.sessions.filter((s) => Date.now() - s.completedAt < 7 * 86400000) ??
      [],
    [data],
  );
  if (!data) return <main className="loading">Loading dashboard…</main>;
  const update = async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    const next = { ...data, settings: { ...data.settings, [key]: value } };
    setData(next);
    await repository.save(next);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiterval-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const safe = importData(JSON.parse(await file.text()));
      await repository.save(safe);
      setData(safe);
    } catch {
      alert("This file is not a valid AIterval export.");
    }
  };
  const accuracy = data.sessions.length
    ? Math.round(
        (data.sessions.filter((s) => s.correct).length / data.sessions.length) *
          100,
      )
    : 0;
  const weak = [
    ...new Set(data.sessions.filter((s) => !s.correct).flatMap((s) => s.tags)),
  ].slice(0, 3);
  return (
    <>
      <nav>
        <a className="brand" href="#today">
          <span>AI</span>AIterval
        </a>
        <div>
          <a href="#today">Today</a>
          <a href="#map">Listening map</a>
          <a href="#history">History</a>
          <a href="#settings">Settings</a>
        </div>
      </nav>
      <main>
        <header className="hero" id="today">
          <div>
            <p className="eyebrow">Local-first listening</p>
            <h1>Small sprints. Real progress.</h1>
            <p>
              Recovered waiting time this week:{" "}
              <strong>
                {formatDuration(week.reduce((n, s) => n + s.activeSeconds, 0))}
              </strong>
            </p>
          </div>
          <Button
            onClick={() => location.assign("../onboarding.html?sample=1")}
          >
            <Headphones />
            Start focused sprint
          </Button>
        </header>
        <section className="stats">
          <StatCard
            label="Recovered this week"
            value={formatDuration(
              week.reduce((n, s) => n + s.activeSeconds, 0),
            )}
          />
          <StatCard
            label="Completed sprints"
            value={String(week.length)}
            detail={
              week.length
                ? "Every listen counts"
                : "Listening once is enough today"
            }
          />
          <StatCard
            label="Accuracy"
            value={data.sessions.length ? `${accuracy}%` : "—"}
            detail={
              data.sessions.length
                ? `${data.sessions.length} total attempts`
                : "No answers yet"
            }
          />
        </section>
        <Card>
          <div className="section-head">
            <div>
              <p className="eyebrow">Weekly goal</p>
              <h2>Opportunities converted</h2>
            </div>
            <strong>
              {week.length} / {data.settings.weeklyGoal}
            </strong>
          </div>
          <ProgressBar
            value={week.length / data.settings.weeklyGoal}
            label="Weekly goal"
          />
          {!week.length && (
            <p className="muted">
              Welcome back — listening once is enough today.
            </p>
          )}
        </Card>
        <section className="split" id="map">
          <Card>
            <div className="section-head">
              <h2>Listening map</h2>
              <small>At least 3 attempts per area</small>
            </div>
            <ListeningMap sessions={data.sessions} />
          </Card>
          <Card>
            <h2>Weak areas</h2>
            {weak.length ? (
              <div className="weak-list">
                {weak.map((tag) => (
                  <div key={tag}>
                    <span>{tag.replaceAll("-", " ")}</span>
                    <Button
                      onClick={() =>
                        location.assign("../onboarding.html?sample=1")
                      }
                    >
                      Focus sprint
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Not enough data yet">
                Weak areas appear after a few real attempts.
              </EmptyState>
            )}
          </Card>
        </section>
        <section className="split">
          <Card>
            <h2>Review queue</h2>
            {data.reviews.filter(
              (r) => (r.nextReviewAt ?? Infinity) <= Date.now(),
            ).length ? (
              <ul>
                {data.reviews
                  .filter((r) => (r.nextReviewAt ?? Infinity) <= Date.now())
                  .slice(0, 5)
                  .map((r) => (
                    <li key={r.exerciseId}>
                      {exercises.find((e) => e.id === r.exerciseId)?.title ??
                        r.exerciseId}
                    </li>
                  ))}
              </ul>
            ) : (
              <EmptyState title="You’re caught up">
                Missed expressions will appear here when due.
              </EmptyState>
            )}
          </Card>
          <Card>
            <h2>Continue saved exercise</h2>
            {data.runtime.sprintState === "saved_for_later" ? (
              <Button
                onClick={() => location.assign("../onboarding.html?sample=1")}
              >
                Continue{" "}
                {exercises.find((e) => e.id === data.runtime.exerciseId)?.title}
              </Button>
            ) : (
              <EmptyState title="Nothing saved">
                Save a sprint when your AI finishes early.
              </EmptyState>
            )}
          </Card>
        </section>
        <Card id="history">
          <div className="section-head">
            <h2>History</h2>
            <span>{data.sessions.length} sessions</span>
          </div>
          {data.sessions.length ? (
            <div className="history">
              <div className="row header">
                <span>Date</span>
                <span>Topic</span>
                <span>Level</span>
                <span>Result</span>
                <span>Replays</span>
                <span>Time</span>
              </div>
              {data.sessions
                .slice(-10)
                .reverse()
                .map((s) => (
                  <div className="row" key={s.id}>
                    <span>{new Date(s.completedAt).toLocaleString()}</span>
                    <span>{s.tags[0]}</span>
                    <span>{s.difficulty}</span>
                    <span>{s.correct ? "Correct" : "Review"}</span>
                    <span>{s.replayCount}</span>
                    <span>{formatDuration(s.activeSeconds)}</span>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState title="Your first sprint starts here">
              History records completed listening activity only.
            </EmptyState>
          )}
        </Card>
        <section id="settings" className="settings">
          <div className="section-title">
            <SettingsIcon />
            <div>
              <p className="eyebrow">Preferences</p>
              <h2>Settings</h2>
            </div>
          </div>
          <Card className="settings-grid">
            <Select
              label="Interface language"
              value={data.settings.language}
              onChange={(e) =>
                void update("language", e.target.value as "ja" | "en")
              }
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </Select>
            <Select
              label="Preferred difficulty"
              value={data.settings.preferredDifficulty}
              onChange={(e) =>
                void update(
                  "preferredDifficulty",
                  Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                )
              }
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </Select>
            <Slider
              label={`Minimum wait: ${data.settings.minimumWaitSeconds}s`}
              min="3"
              max="90"
              value={data.settings.minimumWaitSeconds}
              onChange={(e) =>
                void update("minimumWaitSeconds", Number(e.target.value))
              }
            />
            <Slider
              label={`Cooldown: ${data.settings.cooldownMinutes} min`}
              min="1"
              max="120"
              value={data.settings.cooldownMinutes}
              onChange={(e) =>
                void update("cooldownMinutes", Number(e.target.value))
              }
            />
            <Slider
              label={`Automatic sprints/hour: ${data.settings.maxAutoStartsPerHour}`}
              min="1"
              max="12"
              value={data.settings.maxAutoStartsPerHour}
              onChange={(e) =>
                void update("maxAutoStartsPerHour", Number(e.target.value))
              }
            />
            <Slider
              label={`Weekly goal: ${data.settings.weeklyGoal}`}
              min="1"
              max="50"
              value={data.settings.weeklyGoal}
              onChange={(e) =>
                void update("weeklyGoal", Number(e.target.value))
              }
            />
            <Select
              label="Voice locale"
              value={data.settings.voiceLocale}
              onChange={(e) => void update("voiceLocale", e.target.value)}
            >
              {["en-US", "en-GB", "en-AU", "en-IN", "en-CA"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </Select>
            <Select
              label="Playback rate"
              value={data.settings.playbackRate}
              onChange={(e) =>
                void update(
                  "playbackRate",
                  Number(e.target.value) as 0.8 | 1 | 1.2,
                )
              }
            >
              <option value="0.8">0.8×</option>
              <option value="1">1.0×</option>
              <option value="1.2">1.2×</option>
            </Select>
            <Slider
              label={`Volume: ${Math.round(data.settings.volume * 100)}%`}
              min="0"
              max="1"
              step="0.1"
              value={data.settings.volume}
              onChange={(e) => void update("volume", Number(e.target.value))}
            />
            <Select
              label="Overlay position"
              value={data.settings.overlayPosition}
              onChange={(e) =>
                void update(
                  "overlayPosition",
                  e.target.value as "bottom-right" | "bottom-left",
                )
              }
            >
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </Select>
            <Select
              label="Questions per opportunity"
              value={data.settings.maxQuestions}
              onChange={(e) =>
                void update("maxQuestions", Number(e.target.value) as 1 | 2 | 3)
              }
            >
              <option value="1">1 (recommended)</option>
              <option value="2">2</option>
              <option value="3">3 maximum</option>
            </Select>
            <div className="toggles">
              <Toggle
                checked={data.settings.autoStart}
                onChange={(v) => void update("autoStart", v)}
                label="Auto-start globally"
              />
              <Toggle
                checked={data.settings.adaptiveDifficulty}
                onChange={(v) => void update("adaptiveDifficulty", v)}
                label="Adaptive difficulty"
              />
              <Toggle
                checked={data.settings.soundEnabled}
                onChange={(v) => void update("soundEnabled", v)}
                label="Sound enabled"
              />
              <Toggle
                checked={data.settings.reducedMotion}
                onChange={(v) => void update("reducedMotion", v)}
                label="Reduced motion"
              />
            </div>
            <fieldset>
              <legend>Auto-start sites</legend>
              {(["chatgpt", "claude", "gemini"] as const).map((site) => (
                <Toggle
                  key={site}
                  checked={data.settings.autoStartSites[site]}
                  onChange={(v) =>
                    void update("autoStartSites", {
                      ...data.settings.autoStartSites,
                      [site]: v,
                    })
                  }
                  label={site}
                />
              ))}
            </fieldset>
          </Card>
          <Card className="data-actions">
            <div>
              <Target />
              <span>
                <strong>Local data</strong>
                <small>Export, restore, or remove learning history.</small>
              </span>
            </div>
            <div>
              <Button className="secondary" onClick={exportData}>
                <Download />
                Export data
              </Button>
              <Button
                className="secondary"
                onClick={() => fileRef.current?.click()}
              >
                <Upload />
                Import data
              </Button>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="application/json"
                onChange={(e) => void importFile(e.target.files?.[0])}
              />
              <Button
                className="secondary"
                onClick={() => {
                  void repository.save({ ...data, settings: defaultSettings });
                  location.reload();
                }}
              >
                <RotateCcw />
                Reset onboarding
              </Button>
              <Button className="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                Delete all local data
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <Modal
        open={confirmDelete}
        title="Delete all local data?"
        onClose={() => setConfirmDelete(false)}
      >
        <p>
          This permanently removes settings, progress, reviews, and history from
          this browser.
        </p>
        <div className="modal-actions">
          <Button className="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            className="danger"
            onClick={() =>
              void repository.clear().then(() => location.reload())
            }
          >
            Delete everything
          </Button>
        </div>
      </Modal>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<Dashboard />);
