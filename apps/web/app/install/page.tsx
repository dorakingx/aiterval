import type { Metadata } from "next";
import { Archive, CheckCircle2, FolderOpen, Settings } from "lucide-react";
export const metadata: Metadata = { title: "Installation guide" };
export default function Page() {
  return (
    <main className="content-page">
      <header className="page-hero">
        <p className="kicker">Local installation</p>
        <h1>Three minutes to your first interval.</h1>
        <p>
          AIterval is not yet in the Chrome Web Store. Install locally from the
          GitHub release build.
        </p>
      </header>
      <section className="install-steps">
        <article>
          <Archive />
          <span>1</span>
          <h2>Download and unzip</h2>
          <p>
            Download the latest extension ZIP from the GitHub Releases page and
            unzip it to a folder you will keep.
          </p>
        </article>
        <article>
          <Settings />
          <span>2</span>
          <h2>Open Chrome extensions</h2>
          <p>
            Visit <code>chrome://extensions</code> and turn on Developer mode in
            the upper-right corner.
          </p>
        </article>
        <article>
          <FolderOpen />
          <span>3</span>
          <h2>Load unpacked</h2>
          <p>
            Choose Load unpacked and select the extracted folder containing{" "}
            <code>manifest.json</code>.
          </p>
        </article>
        <article>
          <CheckCircle2 />
          <span>4</span>
          <h2>Run onboarding</h2>
          <p>
            Choose your goal, topics, level, voice, and supported sites. You can
            skip or change every setting later.
          </p>
        </article>
      </section>
      <aside className="notice">
        <strong>For developers on macOS</strong>
        <p>
          Clone the repository, run <code>pnpm install</code> and{" "}
          <code>pnpm build</code>, then load{" "}
          <code>apps/extension/.output/chrome-mv3</code> as the unpacked
          extension.
        </p>
      </aside>
    </main>
  );
}
