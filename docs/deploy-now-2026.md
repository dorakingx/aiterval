# デプロイナウコンテスト2026

作品名: **AIterval — AIの待ち時間を英語学習時間に変える**

- 公開URL: <https://aiterval.lolipop-now.app/>
- 公式要項: <https://lolipop.jp/deploy-now/contest/>
- 応募状況: 公開後の最終確認中。フォーム送信の受領確認前。
- 目標: 2026年10月31日23:59 JSTの月間賞締切。
- 最終締切: 2026年12月8日23:59 JST。
- 作業ブランチ: `contest/deploy-now-2026`。既存Vercel本番に使うmainは変更しない。

## 作品の範囲

Chrome拡張はChatGPT・Claude・Geminiの生成状態を示すUIシグナルを観察する。会話本文は読み取らない。132問のオリジナル教材、端末内の履歴・復習予定、書き出し・削除機能を維持する。

コンテスト用Webデモは約8.5秒のタイマーでAI応答待ちを再現する。AIサービスへの接続や実際の状態検知は行わない。ユーザー操作で英語音声を再生し、回答と日本語の解説を確認できる。通知が出ても同じプレーヤーを維持する。Webの結果はページを開いている間だけ保持し、拡張の永続的な学習履歴とは区別する。音声はブラウザ・端末の英語読み上げ機能を使い、品質・利用可否は端末に依存する。

## デプロイ構成

元のpnpm workspaceのWebは`apps/web`。デプロイナウのnpm向けに、`scripts/stage-lolipop.mjs`でWebソースとcore/content/uiのみを独立したnpm workspaceへ切り出す。`.env`、Gitデータ、認証情報、テスト、開発用成果物、応募記録はコピーしない。

```sh
node scripts/stage-lolipop.mjs /absolute/path/to/empty/staging
cd /absolute/path/to/empty/staging
npm install --package-lock-only --ignore-scripts
npm ci --ignore-scripts
npm run build
npm audit --omit=dev
lolipop deploy --dir . --project <existing-project-id>
```

- Node.js 22.12以上（検証では22.23.1）。
- framework: `next` / install: `npm ci --ignore-scripts` / build: `npm run build`。
- root: stagingの直下（元リポジトリをそのまま`apps/web`指定でアップロードしない）。
- output: `.next/standalone`。`AITERVAL_STANDALONE=1`で有効化。
- `AITERVAL_CONTEST=1`はコンテスト版のルートページと日本語メタデータを選択する。
- ビルドスクリプトに公開originを指定。APIキー・実行時のAI呼び出しは不要。
- Freeプランを維持。GitHub自動デプロイ連携は設定せず、CLIで対象プロジェクトへ公開。

## 検証記録（2026年10月19日）

- lint、全workspaceの型チェック、単体51件、Web/拡張のproduction build: 成功。
- 既存Playwright E2E全21件: 成功。拡張のChatGPT/Claude/Gemini fixture、非中断通知、重複イベント、200%拡大、AAコントラスト、狭幅表示、保存・終了、ローカル指標を含む。
- E2Eは本番ビルドを起動する構成に変更。開発サーバー固有のCSP/eval・オリジン制約の影響を避け、実際の公開条件で検証する。
- 日本語プレーヤーの回帰テストで通知時に音声を停止しないこと、回答・根拠・完了コールバックを確認。
- 公開用npm workspaceの依存監査: 脆弱性0件。
- 公開サイトはログイン不要のHTTP 200。CSP / nosniff / DENY / Referrer-Policy / Permissions-Policyを確認。
- `.env`は403、`.git/config`と`package.json`は404。秘密情報はアップロードしない。
- 実ブラウザで英語音声41種類と`speechSynthesis.speaking=true`を確認。公開URLのコンソールエラー0件。

## 依存関係の制約

Next.jsは16.4.2、PostCSSは8.5.31へ更新。開発ツールの修正可能な依存も更新。全モノレポのauditには、WXT→web-ext-run→Android adbkitに含まれるnode-forge 1.4.0のRSA署名検証に関する既知のhigh 1件が残る（GHSA-86w9-cpqp-85rv、修正版未提供）。この開発ツールはWebの公開用npm workspaceや拡張の配布コードに含めない。Webの実行時依存監査は0件。

## 応募・公開の維持

受領確認後に応募状況と日時を追記する。本名・メールアドレス・認証情報・受付番号・個人情報入りスクリーンショットはpublic repositoryへ追加しない。

審査終了までは公開を維持し、応募後の大幅変更と締切後の修正は避ける。公式結果発表は2027年1月中旬予定。受賞後も一定期間の公開維持が求められる。無料プランの利用上限に達した場合に停止する制約は残る。
