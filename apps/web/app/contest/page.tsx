import type { Metadata } from "next";
import Link from "next/link";
import { ContestDemo } from "../../components/contest-demo";
import "./contest.css";

export const metadata: Metadata = {
  title: "AIの待ち時間を、英語学習時間に変える",
  description:
    "AIを待つ15〜90秒で、英語をひとつ。132問のオリジナル教材。インストール不要のWebデモで、学習を中断しない通知を体験。",
};

export default function ContestPage() {
  return (
    <main className="contest-page" lang="ja">
      <header className="contest-hero">
        <p className="contest-wordmark">
          AIterval <span>アイターバル</span>
        </p>
        <p className="kicker">A LITTLE WAIT. A LITTLE GROWTH.</p>
        <h1>
          AIの待ち時間を、
          <br />
          <em>英語学習時間に。</em>
        </h1>
        <p className="contest-lead">
          回答を待つ15〜90秒。スクロールする代わりに、英語をひとつ。
          <br />
          AIが終わっても、あなたのリスニングは止めません。
        </p>
        <div className="contest-trust">
          <span>登録なし</span>
          <span>132問のオリジナル教材</span>
          <span>学習を中断しない通知</span>
        </div>
      </header>
      <ContestDemo />
      <p className="contest-disclosure">
        このWebデモはAIの回答待ちを約8.5秒で再現します。ChatGPT等との接続や実際の状態検知は行いません。音声は端末の英語読み上げ機能を使います。
      </p>
      <section className="contest-principles" aria-label="AItervalの特徴">
        <article>
          <span>01 / SMALL</span>
          <h2>学習の予定を、増やさない。</h2>
          <p>
            短い英文を聞いて、1問だけ。132問の教材はあらかじめ収録されているので、問題生成の待ち時間もAPIキーも必要ありません。
          </p>
        </article>
        <article>
          <span>02 / YOUR PACE</span>
          <h2>AIより、あなたのペースで。</h2>
          <p>
            回答が完成しても、音声や問題はそのまま。聞き終えてから戻ることも、すぐにAIの回答へ戻ることも選べます。
          </p>
        </article>
        <article>
          <span>03 / PRIVATE</span>
          <h2>会話の中身は、見ません。</h2>
          <p>
            Chrome拡張は生成中を示す画面の状態だけを確認します。プロンプトや回答本文は読み取りません。学習履歴と復習データは端末内に保存します。
          </p>
        </article>
      </section>
      <section className="contest-about" id="extension">
        <div>
          <p className="kicker">FROM DEMO TO EVERYDAY</p>
          <h2>
            いつものAIでも、
            <br />
            この小さな学びを。
          </h2>
        </div>
        <div>
          <p>
            Chrome拡張版はChatGPT・Claude・Geminiの生成状態を確認して、学習のきっかけをつくります。各サービスの画面変更で検知できない場合は、手動でも始められます。
          </p>
          <p>
            Webデモの結果はこの画面を開いている間だけ保持します。拡張版は学習履歴・復習予定をローカルに保存でき、書き出し・削除にも対応しています。音声の品質は端末の英語音声に依存します。
          </p>
          <Link href="/install">Chrome拡張の導入手順（英語） →</Link>
          <p className="contest-hint">Chrome Web Storeへの公開は未完了です。</p>
        </div>
      </section>
      <footer className="contest-footer">
        <strong>AIterval</strong>
        <p>小さな待ち時間に、小さな前進を。</p>
        <Link href="https://github.com/dorakingx/aiterval">
          GitHub / ソースコード
        </Link>
        <Link href="/privacy">プライバシー（英語）</Link>
        <a href="#experience">もう1問、聞いてみる ↑</a>
      </footer>
    </main>
  );
}
