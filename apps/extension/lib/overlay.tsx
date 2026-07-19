import { createRoot, type Root } from "react-dom/client";
import { ListeningPlayer } from "@aiterval/ui";
import { generatedExercisesForScheduling } from "@aiterval/core";
import uiStyles from "@aiterval/ui/styles.css?inline";
import { exercises } from "@aiterval/content";
import { repository } from "./repository";
import { detectDocumentTheme } from "./theme";

let root: Root | undefined;
let host: HTMLElement | undefined;
let renderCurrentOverlay: (() => void) | undefined;
let overlayAiReady = false;
let overlaySettled = false;
let restoreFocusTo: HTMLElement | undefined;
let activeStartedAt: number | undefined;

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
  restoreFocusTo =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : undefined;
  overlayAiReady = Boolean(input.aiReady);
  overlaySettled = false;
  host = document.createElement("div");
  host.id = "aiterval-shadow-host";
  host.dataset.aiTheme = detectDocumentTheme(document);
  host.style.position = "fixed";
  host.style.zIndex = "2147483646";
  host.style.bottom = "16px";
  host.style[
    data.settings.overlayPosition === "bottom-left" ? "left" : "right"
  ] = "16px";
  document.documentElement.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `:host{all:initial;display:block;color-scheme:light dark}\n${uiStyles}`;
  const mount = document.createElement("div");
  shadow.append(style, mount);
  root = createRoot(mount);
  activeStartedAt = data.runtime.startedAt ?? Date.now();
  data.runtime = {
    sprintState: "listening",
    exerciseId: exercise.id,
    generatedPackId,
    startedAt: activeStartedAt,
    hostGenerationStatus: overlayAiReady ? "ready" : "generating",
  };
  await repository.save(data);
  const finishWithoutCompletion = async (
    sprintState: "dismissed" | "saved_for_later",
  ) => {
    if (overlaySettled) return;
    overlaySettled = true;
    const current = await repository.load();
    current.runtime =
      sprintState === "saved_for_later"
        ? {
            sprintState,
            exerciseId: exercise.id,
            generatedPackId,
            startedAt: data.runtime.startedAt,
          }
        : { sprintState };
    await repository.save(current);
    const focusTarget = restoreFocusTo;
    hideOverlay();
    if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
  };
  renderCurrentOverlay = () => {
    root?.render(
      <ListeningPlayer
        exercise={exercise}
        aiReady={overlayAiReady}
        locale={data.settings.voiceLocale}
        voiceName={data.settings.voiceName}
        onClose={() => void finishWithoutCompletion("dismissed")}
        onReturnToAi={() => void finishWithoutCompletion("dismissed")}
        onSave={() => void finishWithoutCompletion("saved_for_later")}
        onComplete={async (result) => {
          if (overlaySettled) return;
          overlaySettled = true;
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
          // Recovered time is learning engagement through normal completion.
          // Host readiness is notification-only and never records time itself.
          current.aggregates.totalRecoveredSeconds += result.activeSeconds;
          current.runtime = { sprintState: "completed" };
          await repository.save(current);
          hideOverlay();
        }}
      />,
    );
  };
  renderCurrentOverlay();
}

export async function notifyOverlayAiReady(): Promise<void> {
  if (!host?.isConnected || overlayAiReady || overlaySettled) return;
  const activeHost = host;
  overlayAiReady = true;
  const current = await repository.load();
  if (host !== activeHost || !activeHost.isConnected || overlaySettled) return;
  current.runtime.hostGenerationStatus = "ready";
  await repository.save(current);
  if (host === activeHost && activeHost.isConnected && !overlaySettled)
    renderCurrentOverlay?.();
}

export async function dismissOverlayForNavigation(): Promise<void> {
  if (!host?.isConnected) return;
  const startedAt = activeStartedAt;
  hideOverlay();
  const current = await repository.load();
  if (startedAt !== undefined && current.runtime.startedAt === startedAt) {
    current.runtime = { sprintState: "dismissed" };
    await repository.save(current);
  }
}

export function hideOverlay(): void {
  overlaySettled = true;
  renderCurrentOverlay = undefined;
  root?.unmount();
  root = undefined;
  host?.remove();
  host = undefined;
  overlayAiReady = false;
  restoreFocusTo = undefined;
  activeStartedAt = undefined;
}
export function overlayVisible(): boolean {
  return Boolean(host?.isConnected);
}
