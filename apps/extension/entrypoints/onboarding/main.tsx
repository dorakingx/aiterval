import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Check, Headphones } from "lucide-react";
import {
  Button,
  ListeningPlayer,
  ProgressBar,
  SpeechAudioProvider,
  Toggle,
} from "@aiterval/ui";
import "@aiterval/ui/styles.css";
import { exercises } from "@aiterval/content";
import { repository } from "../../lib/repository";
import "./onboarding.css";
const goals = [
  "Academic lectures",
  "International conversation",
  "Technology English",
  "General listening",
];
const topics = [
  "Research",
  "Daily conversation",
  "AI",
  "Software",
  "Quantum computing",
  "Machine learning",
];
function Onboarding() {
  const sample = new URLSearchParams(location.search).has("sample");
  const [step, setStep] = useState(sample ? 7 : 1);
  const [goal, setGoal] = useState(goals[0]!);
  const [selected, setSelected] = useState(["AI", "Research"]);
  const [level, setLevel] = useState(2);
  const [sites, setSites] = useState({
    chatgpt: true,
    claude: true,
    gemini: true,
  });
  const [voices, setVoices] = useState<string[]>([]);
  useEffect(() => {
    void new SpeechAudioProvider()
      .getVoices()
      .then((v) => setVoices(v.map((x) => `${x.name} (${x.locale})`)));
  }, []);
  const finish = async () => {
    const data = await repository.load();
    data.settings.preferredDifficulty = level as 1 | 2 | 3 | 4 | 5;
    data.settings.preferredTopics = selected.map((x) =>
      x.toLowerCase().replaceAll(" ", "-"),
    );
    data.settings.autoStartSites = sites;
    await repository.save(data);
    location.assign("../options.html");
  };
  if (step === 7)
    return (
      <main className="sample">
        <ListeningPlayer
          exercise={exercises[0]!}
          onComplete={() => setStep(8)}
          onClose={() => setStep(8)}
        />
      </main>
    );
  return (
    <main>
      <aside>
        <div className="logo">AI</div>
        <h1>Make the pause count.</h1>
        <p>AIの待ち時間を、英語が聞こえる時間に。</p>
        <ProgressBar value={step / 8} label="Onboarding progress" />
        <small>Step {step} of 8</small>
      </aside>
      <section>
        <button className="skip" onClick={() => void finish()}>
          Skip setup
        </button>
        {step === 1 && (
          <div className="panel">
            <Headphones />
            <p className="eyebrow">Welcome to AIterval</p>
            <h2>Listen while your AI thinks.</h2>
            <p>
              One 15–90 second listening sprint appears during generation. When
              your AI is ready, AIterval notifies you without cutting off the
              current sentence. Finish the question or return immediately.
            </p>
            <div className="lecture-onboarding">
              <strong>Prepare for an upcoming lecture with GPT-5.6</strong>
              <span>
                Generate personalized exercises from a lecture abstract, then
                import the validated pack from your dashboard.
              </span>
              <small lang="ja">
                講義概要からGPT-5.6がリスニング問題を作成します。
              </small>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="panel">
            <p className="eyebrow">Your goal</p>
            <h2>What should listening unlock?</h2>
            <div className="tiles">
              {goals.map((item) => (
                <button
                  className={goal === item ? "selected" : ""}
                  onClick={() => setGoal(item)}
                  key={item}
                >
                  {goal === item && <Check />}
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="panel">
            <p className="eyebrow">Topics</p>
            <h2>Choose what sounds useful.</h2>
            <div className="chips">
              {topics.map((item) => (
                <button
                  aria-pressed={selected.includes(item)}
                  onClick={() =>
                    setSelected((values) =>
                      values.includes(item)
                        ? values.filter((x) => x !== item)
                        : [...values, item],
                    )
                  }
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="panel">
            <p className="eyebrow">Level</p>
            <h2>Choose a comfortable starting point.</h2>
            <div className="level">
              {[1, 2, 3, 4, 5].map((item) => (
                <button
                  aria-pressed={level === item}
                  onClick={() => setLevel(item)}
                  key={item}
                >
                  {item}
                  <small>
                    {item === 1
                      ? "Short and slow"
                      : item === 5
                        ? "Dense lecture"
                        : "Clear speech"}
                  </small>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="panel">
            <p className="eyebrow">Voice check</p>
            <h2>Your available English voices</h2>
            {voices.length ? (
              <ul>
                {voices.slice(0, 6).map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            ) : (
              <p>
                No English system voice was found. Add one in your operating
                system’s speech settings; everything else remains usable.
              </p>
            )}
          </div>
        )}
        {step === 6 && (
          <div className="panel">
            <p className="eyebrow">Auto-start</p>
            <h2>Where should AIterval notice waiting?</h2>
            {Object.entries(sites).map(([site, value]) => (
              <Toggle
                key={site}
                checked={value}
                onChange={(v) =>
                  setSites((current) => ({ ...current, [site]: v }))
                }
                label={site}
              />
            ))}
          </div>
        )}
        {step === 8 && (
          <div className="panel">
            <Check />
            <p className="eyebrow">Ready</p>
            <h2>Your next wait can become a win.</h2>
            <p>
              No account, no tracking, and no prompt or response content is
              collected.
            </p>
          </div>
        )}
        <footer>
          <Button
            className="secondary"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </Button>
          <Button
            onClick={() => (step === 8 ? void finish() : setStep((s) => s + 1))}
          >
            {step === 6
              ? "Run sample sprint"
              : step === 8
                ? "Open dashboard"
                : "Continue"}
            <ArrowRight />
          </Button>
        </footer>
      </section>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Onboarding />);
