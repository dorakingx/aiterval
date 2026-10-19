"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, Headphones, LoaderCircle } from "lucide-react";
import { Button, ListeningPlayer } from "@aiterval/ui";
import { exercises } from "@aiterval/content";

export function ContestDemo() {
  const [state, setState] = useState<"idle" | "generating" | "ready">("idle");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(18);
  const [completed, setCompleted] = useState(0);
  const [returned, setReturned] = useState(false);
  const [run, setRun] = useState(0);
  const startButton = useRef<HTMLButtonElement>(null);
  const listeningPanel = useRef<HTMLElement>(null);
  const exercise = exercises[index % exercises.length]!;

  useEffect(() => {
    if (state !== "generating") return;
    const timer = window.setTimeout(() => setState("ready"), 8500);
    return () => window.clearTimeout(timer);
  }, [state, run]);

  useEffect(() => {
    if (open) listeningPanel.current?.focus();
    else if (returned) startButton.current?.focus({ preventScroll: true });
  }, [open, returned]);

  const close = () => {
    setOpen(false);
    setReturned(true);
  };
  const start = () => {
    setRun((value) => value + 1);
    setState("generating");
    setReturned(false);
    setOpen(true);
  };

  return (
    <div className="contest-experience" id="experience">
      <section className="contest-assistant" aria-labelledby="assistant-title">
        <div className="contest-window-head">
          <Bot aria-hidden="true" />
          <strong id="assistant-title">AIアシスタント</strong>
          <span>待ち時間の再現</span>
        </div>
        <p className="contest-prompt">この実験の進め方を整理して。</p>
        <div
          className={`contest-response ${state}`}
          role="status"
          aria-live="polite"
        >
          {state === "idle" ? (
            <>
              <Headphones aria-hidden="true" />
              <p>
                いつものAIの待ち時間。
                <br />
                今日は、英語をひとつ聞いてみる。
              </p>
            </>
          ) : state === "generating" ? (
            <>
              <LoaderCircle className="spin" aria-hidden="true" />
              <p>
                AIが回答を作成しています…
                <br />
                <small>待っている間に、右のリスニングへ。</small>
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 aria-hidden="true" />
              <p>
                回答が完成しました。
                <br />
                <small>リスニングは、そのまま続けられます。</small>
              </p>
            </>
          )}
        </div>
        {returned && (
          <p className="contest-result" role="status">
            {completed
              ? `${completed}問の学習が完了しました。`
              : "自分のタイミングで戻れました。"}{" "}
            次は、比較する条件をひとつ決めてみましょう。（サンプル回答）
          </p>
        )}
        {!open && (
          <button className="ai-button" ref={startButton} onClick={start}>
            {state === "idle"
              ? "無料でリスニングを体験"
              : "もう一度、待ち時間を体験"}
          </button>
        )}
        <p className="contest-hint">
          ログイン・インストール不要 / 音声が流れます
        </p>
      </section>
      <section
        className="contest-listening"
        aria-label="英語リスニング体験"
        ref={listeningPanel}
        tabIndex={-1}
      >
        {open ? (
          <ListeningPlayer
            key={index}
            exercise={exercise}
            uiLanguage="ja"
            aiReady={state === "ready"}
            onClose={close}
            onReturnToAi={close}
            onComplete={() => {
              setCompleted((value) => value + 1);
              setIndex((value) => (value + 1) % exercises.length);
              close();
            }}
          />
        ) : (
          <div className="contest-placeholder">
            <Headphones aria-hidden="true" />
            <span>WAIT → LISTEN → LEARN</span>
            <h2>
              その数十秒が、
              <br />
              聞き取れるひとことに。
            </h2>
            <p>
              短い英文を聞く → 1問に答える → 日本語で復習。
              <br />
              AIの回答ができても、音声は止まりません。
            </p>
            <Button onClick={start}>1問、試してみる</Button>
            <small>端末の英語読み上げ音声を使用します。</small>
          </div>
        )}
      </section>
    </div>
  );
}
