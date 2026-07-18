import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@aiterval/ui";
import { Demo } from "../../../components/demo";
import {
  sampleLecture,
  sampleLectureExercises,
} from "../../../lib/sample-lecture";

export const metadata: Metadata = {
  title: "Build Week judge demo",
  description:
    "A no-login, no-key demonstration of AIterval's complete waiting-time learning loop.",
};

export default function JudgeDemoPage() {
  const sample = sampleLectureExercises[0]!;
  return (
    <main className="content-page judge-page">
      <header className="page-hero">
        <p className="kicker">OpenAI Build Week · Education</p>
        <h1>Understand the loop in two minutes.</h1>
        <p>
          No login, API key, installation, or access code is required for this
          interactive sample.
        </p>
        <div className="hero-actions">
          <Link className="link-button" href="/lecture">
            Open Lecture-to-Sprints
          </Link>
          <Link className="text-link" href="/install">
            Install the extension
          </Link>
        </div>
      </header>
      <section aria-labelledby="wait-demo-title">
        <div className="section-head">
          <div>
            <p className="kicker">1 · Normal AI work</p>
            <h2 id="wait-demo-title">Send work. Listen while it runs.</h2>
          </div>
          <Badge>Interactive sample</Badge>
        </div>
        <Demo />
      </section>
      <section className="sample-pack" aria-labelledby="sample-pack-title">
        <div className="section-head">
          <div>
            <p className="kicker">2 · Upcoming lecture</p>
            <h2 id="sample-pack-title">{sampleLecture.title}</h2>
          </div>
          <Badge>Curated sample—not a live GPT-5.6 call</Badge>
        </div>
        <p>{sampleLecture.abstract}</p>
        <Card className="result-card">
          <Badge>
            {sample.estimatedSeconds}s · difficulty {sample.difficulty}
          </Badge>
          <h3>{sample.title}</h3>
          <p>{sample.transcript}</p>
          <strong>{sample.question.prompt}</strong>
          <ol>
            {sample.question.choices.map((choice) => (
              <li key={choice}>{choice}</li>
            ))}
          </ol>
          <small>Answer evidence: {sample.answerEvidence}</small>
        </Card>
        <p>
          <Link className="link-button" href="/lecture">
            Try the full form and live GPT-5.6 path
          </Link>
        </p>
      </section>
      <Card className="judge-notes">
        <h2>What judges are seeing</h2>
        <ul>
          <li>The public sample never calls a paid API.</li>
          <li>
            Live generation requires a private access code and server-side key.
          </li>
          <li>The extension never reads AI prompts or AI responses.</li>
          <li>
            Chrome Web Store publication is not yet complete; the ZIP is
            installable without rebuilding.
          </li>
        </ul>
        <Link href="/privacy">Read the privacy model</Link>
      </Card>
    </main>
  );
}
