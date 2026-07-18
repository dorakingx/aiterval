import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function Page() {
  return (
    <main className="content-page prose">
      <header className="page-hero">
        <p className="kicker">Privacy</p>
        <h1>Observe the wait. Never the work.</h1>
        <p>
          AIterval&apos;s listening library and learning progress remain local.
          The submitted product does not send learning content to OpenAI.
        </p>
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
        All 132 pre-authored exercises work without an API key.
      </p>
      <h2>No runtime content generation</h2>
      <p>
        Runtime AI exercise generation is not part of the submitted product.
        AIterval uses its bundled, original exercise library and does not
        require an OpenAI API key or send lecture material to a generation
        service.
      </p>
      <h2>Your controls</h2>
      <p>
        The dashboard can export validated JSON, import a previously exported
        local backup, and delete all local data after explicit confirmation.
        Imported files are schema-validated before any write.
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
        は生成状態を示す画面上のシグナルだけを観察し、プロンプトや回答本文を収集しません。提出版は132問の内蔵問題だけを使い、OpenAI
        APIキーや実行時の問題生成を必要としません。学習データはローカルに保存され、いつでも書き出し・削除できます。
      </p>
    </main>
  );
}
