import type { Metadata } from "next";
import {
  BrainCircuit,
  Clock3,
  Headphones,
  PauseCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
export const metadata: Metadata = { title: "How it works" };
export default function Page() {
  return (
    <main className="content-page">
      <header className="page-hero">
        <p className="kicker">The habit loop</p>
        <h1>Practice that ends on time.</h1>
        <p>
          AIterval converts a naturally occurring pause into a compact listen,
          answer, and review loop. It never asks you to linger.
        </p>
      </header>
      <section className="timeline">
        <article>
          <Clock3 />
          <div>
            <span>Prompt sent</span>
            <h2>Generation begins</h2>
            <p>
              Site adapters look only for stable interface signals such as busy
              states and stop-generation controls.
            </p>
          </div>
        </article>
        <article>
          <Headphones />
          <div>
            <span>After your threshold</span>
            <h2>One sprint appears</h2>
            <p>
              Listen without text, select one answer, and see concise Japanese
              feedback with the exact evidence.
            </p>
          </div>
        </article>
        <article>
          <PauseCircle />
          <div>
            <span>AI completes</span>
            <h2>The sentence continues</h2>
            <p>
              A readiness notice appears without replacing the exercise. Finish
              the question, return to AI now, or save it for later.
            </p>
          </div>
        </article>
        <article>
          <RotateCcw />
          <div>
            <span>Next opportunity</span>
            <h2>Practice adapts locally</h2>
            <p>
              Due reviews, weak listening skills, recent variety, difficulty,
              and expected wait length shape the next recommendation.
            </p>
          </div>
        </article>
      </section>
      <section className="principles">
        <article>
          <BrainCircuit />
          <h3>Transparent recommendations</h3>
          <p>
            No external AI API. The score is deterministic, explainable, and
            tested.
          </p>
        </article>
        <article>
          <ShieldCheck />
          <h3>Private by default</h3>
          <p>Only learning activity and preferences are stored locally.</p>
        </article>
        <article>
          <Clock3 />
          <h3>Honest progress</h3>
          <p>
            Recovered time is calculated from real active sprint duration—not
            invented XP.
          </p>
        </article>
      </section>
    </main>
  );
}
