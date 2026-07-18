import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@aiterval/ui";
import { Demo } from "../../../components/demo";

export const metadata: Metadata = {
  title: "Build Week judge demo",
  description:
    "A no-login, no-key demonstration of AIterval's complete waiting-time learning loop.",
};

export default function JudgeDemoPage() {
  return (
    <main className="content-page judge-page">
      <header className="page-hero">
        <p className="kicker">OpenAI Build Week · Education</p>
        <h1>Understand the loop in two minutes.</h1>
        <p>
          No login, API key, installation, or access code is required. Every
          listening sprint comes from AIterval&apos;s 132 original pre-authored
          exercises.
        </p>
        <div className="hero-actions">
          <Link className="link-button" href="#wait-demo-title">
            Try the waiting-time loop
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
      <section className="sample-pack" aria-labelledby="library-title">
        <div className="section-head">
          <div>
            <p className="kicker">2 · Built-in learning system</p>
            <h2 id="library-title">132 exercises, ready without a key.</h2>
          </div>
          <Badge>Original pre-authored library</Badge>
        </div>
        <Card className="result-card">
          <h3>Designed for 15–90 second waits</h3>
          <p>
            Exercises cover practical listening skills, international academic
            English, review scheduling, and multiple difficulty levels. They run
            locally in the extension and never require an OpenAI API key.
          </p>
          <ul>
            <li>One focused listening question per wait</li>
            <li>Immediate feedback and transcript evidence</li>
            <li>Local progress, review queue, and weak-skill tracking</li>
          </ul>
        </Card>
      </section>
      <Card className="judge-notes">
        <h2>What judges are seeing</h2>
        <ul>
          <li>The submitted product uses only pre-authored exercises.</li>
          <li>No OpenAI API key, account, or access code is required.</li>
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
