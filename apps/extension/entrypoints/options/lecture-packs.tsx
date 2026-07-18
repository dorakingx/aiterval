import { useRef, useState } from "react";
import {
  Download,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  generatedPackExportSchema,
  parseGeneratedPackExport,
  type StoredData,
} from "@aiterval/core";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ProgressBar,
  Toggle,
} from "@aiterval/ui";

const GENERATOR_URL = "https://aiterval-build-week-doraking.vercel.app/lecture";

export function LecturePacks({
  data,
  save,
}: {
  data: StoredData;
  save: (next: StoredData) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string>();
  const importPack = async (file?: File) => {
    if (!file) return;
    setError("");
    try {
      const imported = parseGeneratedPackExport(JSON.parse(await file.text()));
      const next = {
        ...data,
        generatedPacks: [
          ...data.generatedPacks.filter((pack) => pack.id !== imported.pack.id),
          imported.pack,
        ].slice(-30),
      };
      await save(next);
    } catch {
      setError("This file is not a valid AIterval lecture pack.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const updatePack = async (
    id: string,
    updates: Partial<StoredData["generatedPacks"][number]>,
  ) =>
    save({
      ...data,
      generatedPacks: data.generatedPacks.map((pack) =>
        pack.id === id ? { ...pack, ...updates, updatedAt: Date.now() } : pack,
      ),
    });
  const exportPack = (id: string) => {
    const pack = data.generatedPacks.find((candidate) => candidate.id === id);
    if (!pack) return;
    const safe = generatedPackExportSchema.parse({
      kind: "aiterval-generated-pack",
      schemaVersion: 1,
      pack,
    });
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(safe, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aiterval-${pack.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section id="lecture-packs" className="lecture-packs">
      <Card className="lecture-cta">
        <div>
          <p className="eyebrow">Lecture-to-Sprints</p>
          <h2>Prepare for your next lecture</h2>
          <p>Turn an abstract into listening sprints with GPT-5.6.</p>
          <p lang="ja">
            <strong>次の講義を聞き取る準備</strong>
            <br />
            講義概要からGPT-5.6がリスニング問題を作成します。
          </p>
        </div>
        <div className="lecture-cta-actions">
          <Button
            onClick={() =>
              window.open(GENERATOR_URL, "_blank", "noopener,noreferrer")
            }
          >
            <Plus /> Create from an upcoming lecture
          </Button>
          <Button
            className="secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Upload /> Import validated pack
          </Button>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept="application/json"
            onChange={(event) => void importPack(event.target.files?.[0])}
          />
        </div>
      </Card>
      <Card className="pack-privacy">
        <div>
          <strong>What is sent to GPT-5.6?</strong>
          <p>
            Only lecture information you deliberately enter on the generator
            page. AIterval never sends AI prompts, AI responses, browsing
            history, or raw session history.
          </p>
        </div>
        <Toggle
          checked={data.settings.personalizedGenerationOptIn}
          onChange={(checked) =>
            void save({
              ...data,
              settings: {
                ...data.settings,
                personalizedGenerationOptIn: checked,
              },
            })
          }
          label="Opt in to aggregated personalization (weak skills, difficulty, locale only)"
        />
      </Card>
      {error && (
        <p className="pack-error" role="alert">
          {error}
        </p>
      )}
      <div className="section-head">
        <div>
          <p className="eyebrow">Generated packs</p>
          <h2>Your upcoming lectures</h2>
        </div>
        <span>{data.generatedPacks.length} saved</span>
      </div>
      {data.generatedPacks.length === 0 ? (
        <EmptyState title="No lecture packs yet">
          Generate on the secure web page, then import the validated file here.
        </EmptyState>
      ) : (
        <div className="pack-grid">
          {data.generatedPacks.map((pack) => {
            const exerciseIds = new Set(
              pack.exercises.map((exercise) => exercise.id),
            );
            const complete = data.sessions.filter((session) =>
              exerciseIds.has(session.exerciseId),
            ).length;
            return (
              <Card className="pack-card" key={pack.id}>
                <div className="section-head">
                  <Badge>Generated with {pack.model}</Badge>
                  <Badge>{pack.status}</Badge>
                </div>
                <h3>{pack.name}</h3>
                <p>
                  {pack.exercises.length} exercises · {complete} completed
                  attempts
                </p>
                <ProgressBar
                  value={Math.min(1, complete / pack.exercises.length)}
                  label={`${pack.name} progress`}
                />
                <div className="pack-actions">
                  <Button
                    className="secondary"
                    onClick={() =>
                      void updatePack(pack.id, {
                        status: pack.status === "active" ? "paused" : "active",
                      })
                    }
                  >
                    {pack.status === "active" ? <Pause /> : <Play />}
                    {pack.status === "active" ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    className="secondary"
                    onClick={() => {
                      const name = prompt(
                        "Rename lecture pack",
                        pack.name,
                      )?.trim();
                      if (name)
                        void updatePack(pack.id, { name: name.slice(0, 120) });
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    className="secondary"
                    onClick={() => exportPack(pack.id)}
                  >
                    <Download /> Export
                  </Button>
                  <Button
                    className="secondary"
                    onClick={() =>
                      window.open(
                        GENERATOR_URL,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <RefreshCw /> Regenerate
                  </Button>
                  <Button
                    className="danger"
                    onClick={() => setDeleteId(pack.id)}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal
        open={Boolean(deleteId)}
        title="Delete this lecture pack?"
        onClose={() => setDeleteId(undefined)}
      >
        <p>
          The generated exercises will be removed from this browser. Existing
          session history remains.
        </p>
        <div className="modal-actions">
          <Button className="secondary" onClick={() => setDeleteId(undefined)}>
            Cancel
          </Button>
          <Button
            className="danger"
            onClick={() => {
              void save({
                ...data,
                generatedPacks: data.generatedPacks.filter(
                  (pack) => pack.id !== deleteId,
                ),
              });
              setDeleteId(undefined);
            }}
          >
            Delete pack
          </Button>
        </div>
      </Modal>
    </section>
  );
}
