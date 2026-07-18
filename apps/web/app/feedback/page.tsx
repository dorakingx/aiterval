import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Feedback" };

const questions = [
  "What did you think AIterval did within the first 10 seconds?",
  "Could you start the first listening sprint without help?",
  "Was the AI-ready interruption understandable?",
  "Would you use this during normal AI work? Why or why not?",
  "Which listening topics would make the built-in library more useful?",
  "What was confusing?",
  "Would you prefer automatic start, manual start, or both?",
];

export default function FeedbackPage() {
  return (
    <main className="content-page prose">
      <header className="page-hero">
        <p className="kicker">Feedback / フィードバック</p>
        <h1>Seven questions. No tracking.</h1>
        <p>
          AIterval has no analytics form or tracking pixel. Use these prompts in
          a short conversation and share only what you choose.
        </p>
      </header>
      <ol>
        {questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ol>
      <p lang="ja">
        AItervalは回答を自動収集しません。上の質問を使って短いユーザーテストを行い、同意を得た内容だけを記録してください。
      </p>
      <p>
        Researchers can use the complete consent-aware template in the source
        repository. No result has been pre-filled or fabricated.
      </p>
      <Link className="primary-link" href="/demo/judge">
        Try the judge demo
      </Link>
    </main>
  );
}
