import type { Metadata } from "next";
import {
  Archive,
  Download,
  ExternalLink,
  FileCheck2,
  FolderOpen,
  PackageOpen,
  Settings,
  ToggleRight,
  TriangleAlert,
} from "lucide-react";
import { CopyableValue } from "../../components/copyable-value";

const downloadUrl =
  "https://github.com/dorakingx/aiterval/releases/download/v0.2.0/aitervalextension-0.2.0-chrome.zip";
const releaseUrl = "https://github.com/dorakingx/aiterval/releases/tag/v0.2.0";

export const metadata: Metadata = { title: "Installation guide" };

export default function Page() {
  return (
    <main className="content-page">
      <header className="page-hero">
        <p className="kicker">Local installation</p>
        <h1>Three minutes to your first interval.</h1>
        <p>
          Chrome Web Store publication is not complete. For now, download the
          official release from GitHub and add the extracted extension to
          desktop Chrome yourself.
        </p>
        <div className="install-download-card">
          <div>
            <span className="install-download-label">Official release</span>
            <h2>AIterval v0.2.0 for Chrome</h2>
            <p>
              Chrome cannot install this ZIP directly. Download it, extract it,
              then load the extracted folder by following the steps below.
            </p>
          </div>
          <div className="install-download-actions">
            <a className="primary-link" href={downloadUrl}>
              <Download aria-hidden="true" />
              Download AIterval v0.2.0 for Chrome
            </a>
            <a className="install-release-link" href={releaseUrl}>
              View release details and checksum
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>
      <section
        className="install-browser-address"
        aria-labelledby="chrome-page"
      >
        <div>
          <p className="kicker">Chrome settings page</p>
          <h2 id="chrome-page">Copy this address for step 3</h2>
          <p>
            Paste it into Chrome&apos;s address bar, just like a website
            address.
          </p>
        </div>
        <CopyableValue value="chrome://extensions" />
      </section>
      <section className="install-steps">
        <article>
          <Download aria-hidden="true" />
          <span>1</span>
          <h2>Download the ZIP</h2>
          <p>
            Use the orange download button above to save the official v0.2.0
            release ZIP to your computer.
          </p>
        </article>
        <article>
          <PackageOpen aria-hidden="true" />
          <span>2</span>
          <h2>Extract it</h2>
          <p>
            Open the downloaded ZIP and extract its contents to a folder you
            will keep. Do not select the ZIP itself during installation.
          </p>
        </article>
        <article>
          <Archive aria-hidden="true" />
          <span>3</span>
          <h2>Open Chrome extensions</h2>
          <p>
            Paste <code>chrome://extensions</code> into Chrome&apos;s address
            bar and press Enter.
          </p>
        </article>
        <article>
          <ToggleRight aria-hidden="true" />
          <span>4</span>
          <h2>Enable Developer mode</h2>
          <p>
            Turn on the <strong>Developer mode</strong> switch in the
            upper-right corner of the extensions page.
          </p>
        </article>
        <article>
          <Settings aria-hidden="true" />
          <span>5</span>
          <h2>Choose “Load unpacked”</h2>
          <p>
            Select the <strong>Load unpacked</strong> button that appears after
            Developer mode is enabled.
          </p>
        </article>
        <article>
          <FolderOpen aria-hidden="true" />
          <span>6</span>
          <h2>Select the extracted folder</h2>
          <p>
            Choose the extracted folder that directly contains{" "}
            <code>manifest.json</code>, then confirm your selection.
          </p>
        </article>
      </section>
      <aside className="install-troubleshooting">
        <TriangleAlert aria-hidden="true" />
        <div>
          <strong>“Manifest file is missing”</strong>
          <p>
            Chrome is looking in the wrong place. Make sure you extracted the
            ZIP first, then choose the folder that directly contains{" "}
            <code>manifest.json</code>—not the ZIP file and not a parent folder.
          </p>
        </div>
      </aside>
      <aside className="notice">
        <FileCheck2 aria-hidden="true" />
        <div>
          <strong>After AIterval appears</strong>
          <p>
            Pin AIterval from Chrome&apos;s extensions menu for easy access,
            then open it and follow the short onboarding. Every setting can be
            changed later.
          </p>
        </div>
      </aside>
      <aside className="notice install-developer-note">
        <strong>Building from source instead?</strong>
        <p>
          Developers can clone the repository, run <code>pnpm install</code> and{" "}
          <code>pnpm build</code>, then load{" "}
          <code>apps/extension/.output/chrome-mv3</code> as the unpacked
          extension.
        </p>
      </aside>
    </main>
  );
}
