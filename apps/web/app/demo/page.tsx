import type { Metadata } from "next";
import { Demo } from "../../components/demo";
export const metadata: Metadata = { title: "Interactive demo" };
export default function Page() {
  return (
    <main className="content-page demo-page">
      <header className="page-hero">
        <p className="kicker">Interactive demo</p>
        <h1>
          Send a pretend prompt.
          <br />
          Recover a real minute.
        </h1>
        <p>
          This uses the same shared listening component as the browser
          extension. Speech comes from an available English system voice.
        </p>
      </header>
      <Demo />
    </main>
  );
}
