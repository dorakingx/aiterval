import type { Metadata } from "next";
export const metadata: Metadata = { title: "FAQ" };
const items = [
  [
    "Does AIterval read my prompts?",
    "No. It detects interface state signals and never scrapes conversation content.",
  ],
  [
    "Which AI tools work automatically?",
    "The MVP includes isolated adapters for ChatGPT, Claude, and Gemini. Manual starts remain available when an interface changes.",
  ],
  [
    "Where does the audio come from?",
    "AIterval uses the browser Web Speech API and the English voices installed on your system. It only offers accents that actually exist on your device.",
  ],
  [
    "Do I need an account?",
    "No. Core learning data stays in extension storage.",
  ],
  [
    "Is it in the Chrome Web Store?",
    "Not yet. Install the release ZIP locally from GitHub using the installation guide.",
  ],
  [
    "What happens when my AI finishes early?",
    "Audio pauses and AIterval shows Return to AI, Finish this question, and Save for later.",
  ],
  [
    "Will it interrupt every prompt?",
    "No. The default minimum wait is 5 seconds, cooldown is 10 minutes, and automatic sprints are capped at four per hour. All are configurable.",
  ],
  [
    "Is speaking required?",
    "No. Optional shadowing is self-reported and never requests microphone permission.",
  ],
];
export default function Page() {
  return (
    <main className="content-page">
      <header className="page-hero">
        <p className="kicker">FAQ</p>
        <h1>Useful answers. No fine print.</h1>
      </header>
      <section className="faq-list">
        {items.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
