import { createRoot, type Root } from "react-dom/client";
import { ListeningPlayer } from "@aiterval/ui";
import { generatedExercisesForScheduling } from "@aiterval/core";
import uiStyles from "@aiterval/ui/styles.css?inline";
import { exercises } from "@aiterval/content";
import { repository } from "./repository";

let root: Root | undefined;
let host: HTMLElement | undefined;
export async function showOverlay(
  input: { aiReady?: boolean } = {},
): Promise<void> {
  if (host?.isConnected) return;
  const data = await repository.load();
  const generated = generatedExercisesForScheduling(
    data.generatedPacks,
    data.sessions.slice(-10).map((session) => session.exerciseId),
  );
  const exercise =
    generated.find((item) => item.id === data.runtime.exerciseId) ??
    exercises.find((item) => item.id === data.runtime.exerciseId) ??
    generated[0] ??
    exercises[0];
  if (!exercise) return;
  const generatedPackId = data.generatedPacks.find((pack) =>
    pack.exercises.some((item) => item.id === exercise.id),
  )?.id;
  host = document.createElement("div");
  host.id = "aiterval-shadow-host";
  host.style.position = "fixed";
  host.style.zIndex = "2147483646";
  host.style.bottom = "16px";
  host.style[
    data.settings.overlayPosition === "bottom-left" ? "left" : "right"
  ] = "16px";
  document.documentElement.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `${uiStyles}\n:host{all:initial}`;
  const mount = document.createElement("div");
  shadow.append(style, mount);
  root = createRoot(mount);
  data.runtime = {
    sprintState: input.aiReady ? "paused_ai_ready" : "listening",
    exerciseId: exercise.id,
    generatedPackId,
    startedAt: data.runtime.startedAt ?? Date.now(),
  };
  await repository.save(data);
  const close = async () => {
    const current = await repository.load();
    current.runtime = { sprintState: "dismissed" };
    await repository.save(current);
    hideOverlay();
  };
  root.render(
    <ListeningPlayer
      exercise={exercise}
      initialStage={input.aiReady ? "ai-ready" : "listen"}
      locale={data.settings.voiceLocale}
      voiceName={data.settings.voiceName}
      onClose={() => void close()}
      onSave={async () => {
        const current = await repository.load();
        current.runtime = {
          sprintState: "saved_for_later",
          exerciseId: exercise.id,
          generatedPackId,
          startedAt: data.runtime.startedAt,
        };
        await repository.save(current);
        hideOverlay();
      }}
      onComplete={async (result) => {
        const current = await repository.load();
        const completedAt = Date.now();
        current.sessions.push({
          id: crypto.randomUUID(),
          exerciseId: exercise.id,
          completedAt,
          activeSeconds: result.activeSeconds,
          correct: result.correct,
          replayCount: result.replayCount,
          transcriptRevealed: true,
          locale: current.settings.voiceLocale,
          tags: exercise.tags,
          difficulty: exercise.difficulty,
        });
        current.aggregates.totalCompleted += 1;
        current.aggregates.totalRecoveredSeconds += result.activeSeconds;
        current.runtime = { sprintState: "completed" };
        await repository.save(current);
        hideOverlay();
      }}
    />,
  );
}
export function hideOverlay(): void {
  root?.unmount();
  root = undefined;
  host?.remove();
  host = undefined;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
export function overlayVisible(): boolean {
  return Boolean(host?.isConnected);
}
