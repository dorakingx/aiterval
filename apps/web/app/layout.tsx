import type { Metadata } from "next";
import Link from "next/link";
import "@aiterval/ui/styles.css";
import "./globals.css";
const socialImage = "https://aiterval.local/og.png";
export const metadata: Metadata = {
  metadataBase: new URL("https://aiterval.local"),
  title: {
    default: "AIterval — Listen while AI thinks",
    template: "%s · AIterval",
  },
  description:
    "Turn AI waiting time into 15–90 second English listening practice. Local-first, private, and designed for busy professionals.",
  openGraph: {
    title: "AIterval — Listen while AI thinks",
    description: "Turn AI waiting time into English listening practice.",
    type: "website",
    locale: "en_US",
    alternateLocale: "ja_JP",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "AIterval — Listen while AI thinks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIterval",
    description: "AIの待ち時間を、英語が聞こえる時間に。",
    images: [socialImage],
  },
  robots: { index: true, follow: true },
};
const links = [
  ["/how-it-works", "How it works"],
  ["/demo", "Demo"],
  ["/demo/judge", "Judge demo"],
  ["/lecture", "Lecture-to-Sprints"],
  ["/privacy", "Privacy"],
  ["/faq", "FAQ"],
];
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-nav">
          <Link className="site-brand" href="/">
            <span>AI</span>AIterval
          </Link>
          <nav aria-label="Primary navigation">
            {links.map(([href, label]) => (
              <Link href={href!} key={href}>
                {label}
              </Link>
            ))}
          </nav>
          <Link className="nav-cta" href="/install">
            Install locally
          </Link>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <Link className="site-brand" href="/">
              <span>AI</span>AIterval
            </Link>
            <p>Turn AI waiting time into English listening practice.</p>
            <p lang="ja">AIの待ち時間を、英語が聞こえる時間に。</p>
          </div>
          <div>
            {links.map(([href, label]) => (
              <Link href={href!} key={href}>
                {label}
              </Link>
            ))}
            <Link href="/install">Installation guide</Link>
          </div>
          <small>
            Local-first. No account. No analytics. Built in the open.
          </small>
        </footer>
      </body>
    </html>
  );
}
