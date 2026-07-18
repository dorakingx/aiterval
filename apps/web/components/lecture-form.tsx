"use client";

import { useMemo, useRef, useState } from "react";
import { Download, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import {
  generatedPackExportSchema,
  generationOutputSchema,
  lectureGenerationRequestSchema,
  learningFocuses,
  type GeneratedListeningExercise,
  type LectureGenerationRequest,
} from "@aiterval/core";
import { Badge, Button, Card } from "@aiterval/ui";
import { sampleLecture, sampleLectureExercises } from "../lib/sample-lecture";

type Language = "en" | "ja";
type Result =
  | { kind: "sample"; exercises: typeof sampleLectureExercises; model: null }
  | { kind: "live"; exercises: GeneratedListeningExercise[]; model: string };

const copy = {
  en: {
    title: "Prepare for your next lecture",
    subtitle: "Turn an abstract into listening sprints with GPT-5.6.",
    generate: "Generate with GPT-5.6",
    sample: "Try the no-key sample",
    sent: "What is sent to GPT-5.6?",
    privacy:
      "Only the lecture information and learning preferences you enter below. Your AI prompts, AI responses, browsing history, and session history are never sent.",
  },
  ja: {
    title: "次の講義を聞き取る準備",
    subtitle: "講義概要からGPT-5.6がリスニング問題を作成します。",
    generate: "GPT-5.6で生成",
    sample: "APIキー不要のサンプル",
    sent: "GPT-5.6に送信される情報",
    privacy:
      "入力した講義情報と学習設定だけを送信します。AIへのプロンプト、AIの回答、閲覧履歴、学習履歴そのものは送信しません。",
  },
};

const initial: LectureGenerationRequest = {
  lectureTitle: "",
  lectureAbstract: "",
  expectedTechnicalTerms: [],
  userLevel: "B2",
  difficulty: 3,
  targetSeconds: 45,
  exerciseCount: 2,
  learningFocus: "main-idea",
  preferredLocale: "en-GB",
  eventContext: "",
  japaneseExplanation: true,
  schemaVersion: 1,
};

export function LectureForm() {
  const [language, setLanguage] = useState<Language>("en");
  const [form, setForm] = useState(initial);
  const [terms, setTerms] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const text = copy[language];
  const request = useMemo(
    () => ({
      ...form,
      expectedTechnicalTerms: terms
        .split(/[,\n]/)
        .map((term) => term.trim())
        .filter(Boolean),
    }),
    [form, terms],
  );
  const set = <K extends keyof LectureGenerationRequest>(
    key: K,
    value: LectureGenerationRequest[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const showSample = () => {
    setError("");
    setResult({
      kind: "sample",
      exercises: sampleLectureExercises,
      model: null,
    });
  };

  const generate = async () => {
    setError("");
    const parsed = lectureGenerationRequestSchema.safeParse(request);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form limits.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const session =
        sessionStorage.getItem("aiterval-generation-session") ||
        crypto.randomUUID();
      sessionStorage.setItem("aiterval-generation-session", session);
      const response = await fetch("/api/generate-sprints", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-demo-access-code": accessCode,
          "x-aiterval-session": session,
        },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      const body = (await response.json()) as {
        exercises?: unknown;
        metadata?: { model?: string };
        message?: string;
      };
      if (!response.ok) throw new Error(body.message || "Generation failed.");
      const exercises = generationOutputSchema.parse({
        exercises: body.exercises,
      }).exercises;
      setResult({
        kind: "live",
        exercises,
        model: body.metadata?.model || exercises[0]?.model || "gpt-5.6",
      });
      setForm((current) => ({ ...current, lectureAbstract: "" }));
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError")
        setError("Generation cancelled. Your lecture text was not saved.");
      else
        setError(
          cause instanceof Error
            ? `${cause.message} The sample remains available.`
            : "Generation failed safely. The sample remains available.",
        );
    } finally {
      setLoading(false);
      abortRef.current = undefined;
    }
  };

  const download = () => {
    if (!result || result.kind !== "live") return;
    const now = Date.now();
    const pack = generatedPackExportSchema.parse({
      kind: "aiterval-generated-pack",
      schemaVersion: 1,
      pack: {
        id: `lecture-${now}`,
        name: result.exercises[0]?.lectureTitle || request.lectureTitle,
        lectureTitle: result.exercises[0]?.lectureTitle || request.lectureTitle,
        createdAt: now,
        updatedAt: now,
        source: "gpt-5.6",
        model: result.model,
        generationVersion: 1,
        status: "active",
        exercises: result.exercises,
      },
    });
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aiterval-${pack.pack.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lecture-builder">
      <header className="lecture-heading">
        <div>
          <p className="kicker">Lecture-to-Sprints</p>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>
        <div className="language-switch" aria-label="Interface language">
          <button
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            aria-pressed={language === "ja"}
            onClick={() => setLanguage("ja")}
          >
            日本語
          </button>
        </div>
      </header>
      <Card className="lecture-form-card">
        <div className="form-grid">
          <label className="wide">
            <span>
              Lecture title <small>{form.lectureTitle.length}/180</small>
            </span>
            <input
              value={form.lectureTitle}
              maxLength={180}
              onChange={(event) => set("lectureTitle", event.target.value)}
            />
          </label>
          <label className="wide">
            <span>
              Abstract or description{" "}
              <small>{form.lectureAbstract.length}/6000</small>
            </span>
            <textarea
              rows={7}
              value={form.lectureAbstract}
              maxLength={6000}
              onChange={(event) => set("lectureAbstract", event.target.value)}
            />
          </label>
          <label className="wide">
            <span>
              Expected technical terms{" "}
              <small>comma or line separated · max 20 × 80</small>
            </span>
            <textarea
              rows={2}
              value={terms}
              maxLength={1600}
              onChange={(event) => setTerms(event.target.value)}
            />
          </label>
          <label>
            <span>Listening level</span>
            <select
              value={form.userLevel}
              onChange={(event) =>
                set(
                  "userLevel",
                  event.target.value as LectureGenerationRequest["userLevel"],
                )
              }
            >
              {["A2", "B1", "B2", "C1"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select
              value={form.difficulty}
              onChange={(event) =>
                set(
                  "difficulty",
                  Number(
                    event.target.value,
                  ) as LectureGenerationRequest["difficulty"],
                )
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Seconds per sprint</span>
            <input
              type="number"
              min={15}
              max={90}
              value={form.targetSeconds}
              onChange={(event) =>
                set("targetSeconds", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>Exercises</span>
            <input
              type="number"
              min={1}
              max={5}
              value={form.exerciseCount}
              onChange={(event) =>
                set("exerciseCount", Number(event.target.value))
              }
            />
          </label>
          <label>
            <span>Learning focus</span>
            <select
              value={form.learningFocus}
              onChange={(event) =>
                set(
                  "learningFocus",
                  event.target
                    .value as LectureGenerationRequest["learningFocus"],
                )
              }
            >
              {learningFocuses.map((value) => (
                <option value={value} key={value}>
                  {value.replaceAll("-", " ")}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>English locale</span>
            <select
              value={form.preferredLocale}
              onChange={(event) =>
                set(
                  "preferredLocale",
                  event.target
                    .value as LectureGenerationRequest["preferredLocale"],
                )
              }
            >
              {["en-US", "en-GB", "en-AU", "en-IN", "en-CA"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="wide">
            <span>
              Optional event context{" "}
              <small>{form.eventContext.length}/800</small>
            </span>
            <input
              value={form.eventContext}
              maxLength={800}
              onChange={(event) => set("eventContext", event.target.value)}
            />
          </label>
          <label className="check wide">
            <input
              type="checkbox"
              checked={form.japaneseExplanation}
              onChange={(event) =>
                set("japaneseExplanation", event.target.checked)
              }
            />{" "}
            Include concise Japanese explanations
          </label>
          <label className="wide">
            <span>
              Judge access code <small>required only for live generation</small>
            </span>
            <input
              type="password"
              autoComplete="off"
              value={accessCode}
              maxLength={128}
              onChange={(event) => setAccessCode(event.target.value)}
            />
          </label>
        </div>
        <details className="privacy-disclosure">
          <summary>
            <ShieldCheck /> {text.sent}
          </summary>
          <p>{text.privacy}</p>
        </details>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button disabled={loading} onClick={() => void generate()}>
            {loading ? <LoaderCircle className="spin" /> : <Sparkles />}
            {loading ? "Generating…" : text.generate}
          </Button>
          {loading && (
            <Button
              className="secondary"
              onClick={() => abortRef.current?.abort()}
            >
              <X /> Cancel
            </Button>
          )}
          <Button className="secondary" disabled={loading} onClick={showSample}>
            {text.sample}
          </Button>
        </div>
      </Card>
      {result && (
        <section className="lecture-results" aria-live="polite">
          <div className="section-head">
            <div>
              <p className="kicker">Result</p>
              <h2>
                {result.kind === "live"
                  ? "Your personalized lecture pack"
                  : sampleLecture.title}
              </h2>
            </div>
            <Badge>
              {result.kind === "live"
                ? `Generated with ${result.model}`
                : "Curated sample · not live GPT-5.6 output"}
            </Badge>
          </div>
          {result.kind === "sample" && <p>{sampleLecture.abstract}</p>}
          <div className="result-grid">
            {result.exercises.map((exercise) => (
              <Card key={exercise.id} className="result-card">
                <Badge>
                  {exercise.estimatedSeconds}s · level {exercise.difficulty}
                </Badge>
                <h3>{exercise.title}</h3>
                <p>{exercise.transcript}</p>
                <strong>{exercise.question.prompt}</strong>
                <ol>
                  {exercise.question.choices.map((choice) => (
                    <li key={choice}>{choice}</li>
                  ))}
                </ol>
                <small>Evidence: {exercise.answerEvidence}</small>
              </Card>
            ))}
          </div>
          {result.kind === "live" && (
            <Button onClick={download}>
              <Download /> Download validated extension pack
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
