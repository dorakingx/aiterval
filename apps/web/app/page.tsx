import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Headphones,
  LockKeyhole,
  PauseCircle,
  Target,
} from "lucide-react";
import { Demo } from "../components/demo";
export default function Home() {
  return (
    <main>
      <section className="home-hero">
        <div className="hero-copy">
          <p className="kicker">English practice that fits between prompts</p>
          <h1>
            Your AI is thinking.
            <br />
            <em>Your English can be listening.</em>
          </h1>
          <p className="lead">
            AIterval turns the short wait after you send a prompt into one
            focused, 15–90 second listening sprint—then gets out of your way.
          </p>
          <p className="ja" lang="ja">
            AIの待ち時間を、英語が聞こえる時間に。
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/install">
              Install from GitHub release <ArrowRight />
            </Link>
            <Link className="text-link" href="/demo">
              Try the interactive demo
            </Link>
          </div>
          <div className="trust">
            <span>
              <LockKeyhole />
              No account
            </span>
            <span>
              <PauseCircle />
              Stops when AI is ready
            </span>
            <span>
              <Target />
              One question by default
            </span>
          </div>
        </div>
        <Demo compact />
      </section>
      <section className="statement">
        <p>
          Built for researchers, engineers, and creators who already spend the
          day with AI.
        </p>
        <h2>
          Keep your workflow.
          <br />
          Recover the waiting.
        </h2>
      </section>
      <section className="steps">
        <article>
          <span>01</span>
          <Clock3 />
          <h3>Prompt as usual</h3>
          <p>
            AIterval notices generation-state controls—not your prompt or the
            response text.
          </p>
        </article>
        <article>
          <span>02</span>
          <Headphones />
          <h3>Listen once</h3>
          <p>
            Hear a short original passage without the transcript, then answer
            one quick question.
          </p>
        </article>
        <article>
          <span>03</span>
          <PauseCircle />
          <h3>Return to work</h3>
          <p>
            When your AI finishes, audio pauses and your progress is saved
            immediately.
          </p>
        </article>
      </section>
      <section className="feature-band">
        <div>
          <p className="kicker">Minimum success</p>
          <h2>Listening once is enough today.</h2>
          <p>
            No fragile daily streak. No infinite feed. AIterval measures real
            active listening time and opportunities converted.
          </p>
          <Link className="text-link light" href="/how-it-works">
            See the learning system <ArrowRight />
          </Link>
        </div>
        <div className="recovered">
          <small>Example week · recovered waiting time</small>
          <strong>18m 40s</strong>
          <div>
            <span style={{ width: "68%" }} />
          </div>
          <p>Example: 7 of 10 opportunities converted</p>
        </div>
      </section>
      <section className="privacy-callout">
        <LockKeyhole />
        <div>
          <p className="kicker">Privacy by construction</p>
          <h2>Your work stays yours.</h2>
          <p>
            Prompts and AI responses are never read, stored, transmitted, or
            logged. Learning data stays in browser extension storage and can be
            exported or deleted at any time.
          </p>
        </div>
        <Link className="text-link" href="/privacy">
          Read the privacy promise <ArrowRight />
        </Link>
      </section>
      <section className="closing">
        <BookOpen />
        <h2>
          Don’t find study time.
          <br />
          Find the time already waiting.
        </h2>
        <Link className="primary-link" href="/install">
          Get the local build <ArrowRight />
        </Link>
        <small>
          AIterval is an MVP and is not yet published in the Chrome Web Store.
        </small>
      </section>
    </main>
  );
}
