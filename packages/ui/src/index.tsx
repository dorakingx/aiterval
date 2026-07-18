"use client";
import {
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronRight,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import type { ListeningExercise, SessionRecord } from "@aiterval/core";
import { formatDuration } from "@aiterval/core";
import { SpeechAudioProvider, type AudioProvider } from "./audio";
export * from "./audio";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ai-button ${className}`} {...props} />;
}
export function IconButton({
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      className="ai-icon-button"
      aria-label={label}
      title={label}
      {...props}
    />
  );
}
export function Card({
  children,
  className = "",
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section className={`ai-card ${className}`} {...props}>
      {children}
    </section>
  );
}
export function Badge({ children }: PropsWithChildren) {
  return <span className="ai-badge">{children}</span>;
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="ai-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
    >
      <span style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="ai-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span aria-hidden="true" />
      {label}
    </label>
  );
}
export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="ai-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </Card>
  );
}
export function EmptyState({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="ai-empty">
      <Headphones aria-hidden="true" />
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
  );
}
export function WeeklyGoal({
  completed,
  goal,
}: {
  completed: number;
  goal: number;
}) {
  return (
    <div className="ai-weekly">
      <div>
        <strong>
          {completed} / {goal}
        </strong>
        <span>opportunities converted</span>
      </div>
      <ProgressBar value={completed / goal} label="Weekly goal progress" />
    </div>
  );
}

export function ListeningMap({ sessions }: { sessions: SessionRecord[] }) {
  const tags = [
    "main-idea",
    "detail",
    "numbers",
    "names",
    "connected-speech",
    "technical-terms",
    "academic",
    "daily",
  ];
  return (
    <div className="ai-map">
      {tags.map((tag) => {
        const matching = sessions.filter((session) =>
          session.tags.includes(tag),
        );
        const score = matching.length
          ? matching.filter((item) => item.correct).length / matching.length
          : 0;
        return (
          <div key={tag}>
            <span>{tag.replaceAll("-", " ")}</span>
            {matching.length < 3 ? (
              <small>Not enough data yet</small>
            ) : (
              <ProgressBar value={score} label={`${tag} accuracy`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

type Stage = "listen" | "answer" | "feedback" | "ai-ready";
export interface ListeningPlayerProps {
  exercise: ListeningExercise;
  audioProvider?: AudioProvider;
  locale?: string;
  voiceName?: string;
  initialStage?: Stage;
  onComplete?: (result: {
    correct: boolean;
    replayCount: number;
    activeSeconds: number;
  }) => void;
  onSave?: () => void;
  onClose?: () => void;
}

export function ListeningPlayer({
  exercise,
  audioProvider,
  locale = "en-US",
  voiceName = "",
  initialStage = "listen",
  onComplete,
  onSave,
  onClose,
}: ListeningPlayerProps) {
  const provider = useMemo(
    () => audioProvider ?? new SpeechAudioProvider(),
    [audioProvider],
  );
  const [stage, setStage] = useState<Stage>(initialStage);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<0.8 | 1 | 1.2>(1);
  const [replays, setReplays] = useState(0);
  const [selected, setSelected] = useState<number>();
  const [error, setError] = useState("");
  const start = useRef(Date.now());
  const play = async () => {
    setError("");
    setPlaying(true);
    setReplays((value) => value + 1);
    try {
      await provider.play({
        text: exercise.transcript,
        locale,
        voiceName,
        rate,
        volume: 1,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Audio is unavailable.",
      );
    } finally {
      setPlaying(false);
    }
  };
  const close = () => {
    provider.stop();
    onClose?.();
  };
  if (stage === "ai-ready")
    return (
      <Card className="ai-player ai-ready">
        <Badge>Your AI is ready</Badge>
        <h2>Return when you’re ready</h2>
        <p>Your listening sprint is paused. Your progress is safe.</p>
        <div className="ai-actions">
          <Button onClick={() => setStage("answer")}>
            Finish this question
          </Button>
          <Button className="secondary" onClick={onSave}>
            Save for later
          </Button>
          <Button className="ghost" onClick={close}>
            Return to AI
          </Button>
        </div>
      </Card>
    );
  return (
    <Card className="ai-player" aria-label="AIterval listening sprint">
      <header>
        <div>
          <div className="ai-badge-row">
            <Badge>{exercise.estimatedSeconds}s sprint</Badge>
            <Badge>
              {"source" in exercise && exercise.source === "gpt-5.6"
                ? "Generated with GPT-5.6"
                : "Built-in exercise"}
            </Badge>
          </div>
          <h2>
            {stage === "listen"
              ? "Listen first"
              : stage === "answer"
                ? "One quick question"
                : selected === exercise.question.correctIndex
                  ? "That’s right"
                  : "Almost — listen for this"}
          </h2>
        </div>
        {onClose && (
          <IconButton label="Close listening sprint" onClick={close}>
            <X />
          </IconButton>
        )}
      </header>
      {stage === "listen" && (
        <>
          <p>The transcript stays hidden until you answer.</p>
          <button
            className="ai-play"
            onClick={() => void play()}
            aria-label={
              playing ? "Pause audio" : replays ? "Replay audio" : "Play audio"
            }
          >
            {playing ? <Pause /> : replays ? <RotateCcw /> : <Play />}
            <span>{playing ? "Listening…" : replays ? "Replay" : "Play"}</span>
          </button>
          {error && (
            <p role="alert" className="ai-error">
              {error}
            </p>
          )}
          <div className="ai-rate" aria-label="Playback rate">
            {([0.8, 1, 1.2] as const).map((value) => (
              <button
                aria-pressed={rate === value}
                onClick={() => setRate(value)}
                key={value}
              >
                {value.toFixed(1)}×
              </button>
            ))}
          </div>
          <Button
            disabled={!replays}
            onClick={() => {
              provider.stop();
              setStage("answer");
            }}
          >
            Answer one question <ChevronRight />
          </Button>
        </>
      )}
      {stage === "answer" && (
        <>
          <p className="ai-question">{exercise.question.prompt}</p>
          <div className="ai-choices">
            {exercise.question.choices.map((choice, index) => (
              <button
                key={choice}
                className={selected === index ? "selected" : ""}
                onClick={() => setSelected(index)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {choice}
              </button>
            ))}
          </div>
          <Button
            disabled={selected === undefined}
            onClick={() => setStage("feedback")}
          >
            Check answer
          </Button>
        </>
      )}
      {stage === "feedback" && (
        <div className="ai-feedback">
          <div
            className={
              selected === exercise.question.correctIndex
                ? "correct"
                : "incorrect"
            }
          >
            <Check />
            {selected === exercise.question.correctIndex
              ? "Correct"
              : `Correct answer: ${exercise.question.choices[exercise.question.correctIndex]}`}
          </div>
          <p className="ai-transcript">
            {exercise.transcript
              .split(exercise.answerEvidence)
              .map((part, index, all) => (
                <span key={`${part}-${index}`}>
                  {part}
                  {index < all.length - 1 && (
                    <mark>{exercise.answerEvidence}</mark>
                  )}
                </span>
              ))}
          </p>
          <p>{exercise.explanationJa}</p>
          <dl>
            <dt>Expression</dt>
            <dd>{exercise.keyExpression}</dd>
          </dl>
          <div className="ai-shadow">
            <Volume2 />
            <span>Shadowing (optional)</span>
            <strong>{exercise.answerEvidence}</strong>
            <div>
              <button>Easy</button>
              <button>Okay</button>
              <button>Difficult</button>
            </div>
          </div>
          <div className="ai-feedback-actions">
            <button>I understood it after seeing the transcript</button>
            <button>Still difficult</button>
          </div>
          <Button
            onClick={() => {
              provider.stop();
              onComplete?.({
                correct: selected === exercise.question.correctIndex,
                replayCount: replays,
                activeSeconds: Math.max(
                  1,
                  Math.round((Date.now() - start.current) / 1000),
                ),
              });
            }}
          >
            Complete sprint
          </Button>
        </div>
      )}
    </Card>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="ai-modal-backdrop" role="presentation">
      <div
        className="ai-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </header>
        {children}
      </div>
    </div>
  );
}
export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="ai-field">
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}
export function Slider({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="ai-field">
      <span>{label}</span>
      <input type="range" {...props} />
    </label>
  );
}
export function Tooltip({
  text,
  children,
}: PropsWithChildren<{ text: string }>) {
  return (
    <span className="ai-tooltip" data-tip={text}>
      {children}
    </span>
  );
}
export { formatDuration };
