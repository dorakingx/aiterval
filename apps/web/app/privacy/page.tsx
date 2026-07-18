import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function Page() {
  return (
    <main className="content-page prose">
      <header className="page-hero">
        <p className="kicker">Privacy</p>
        <h1>Observe the wait. Never the work.</h1>
        <p>AIterval is local-first and requires no account.</p>
      </header>
      <h2>What the extension observes</h2>
      <p>
        On ChatGPT, Claude, and Gemini, AIterval observes generation-state UI
        signals such as accessible labels, busy states, and stop-generation
        controls. This tells the extension whether generation appears to be
        idle, active, or completed.
      </p>
      <h2>What it never collects</h2>
      <p>
        The extension does not read, store, transmit, or log prompt text, AI
        response text, conversation content, page history, analytics
        identifiers, advertising identifiers, or hidden telemetry.
      </p>
      <h2>What stays in your browser</h2>
      <p>
        Settings, sprint progress, answers, review schedules, session history,
        and aggregate recovered time live in extension storage. History is
        capped at 500 detailed sessions while aggregate totals are preserved.
      </p>
      <h2>Your controls</h2>
      <p>
        The dashboard can export validated JSON, import a previously exported
        file, and delete all local data after explicit confirmation. Imported
        files are schema-validated before any write.
      </p>
      <h2>Permissions</h2>
      <p>
        Storage saves learning data. Access to the three supported AI hosts
        enables wait-state detection. Active Tab and Scripting allow a
        user-initiated manual sprint. Context Menus provides a manual start
        command. No remote executable code is used.
      </p>
      <p lang="ja">
        AIterval
        は生成状態を示す画面上のシグナルだけを観察し、プロンプトや回答本文を収集しません。学習データはローカルに保存され、いつでも書き出し・削除できます。
      </p>
    </main>
  );
}
