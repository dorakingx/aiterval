"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyableValueProps = {
  value: string;
};

export function CopyableValue({ value }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <div className="copyable-value">
      <code>{value}</code>
      <button type="button" onClick={copyValue} aria-label={`Copy ${value}`}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${value} copied to clipboard.` : ""}
      </span>
    </div>
  );
}
