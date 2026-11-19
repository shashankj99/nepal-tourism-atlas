"use client";

import { useState } from "react";

export function CodeBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("Copied");
    } catch {
      setStatus("Select the code to copy it.");
    }
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{label}</span>
        <div className="copy">
          <span role="status">{status}</span>
          <button type="button" aria-label={`Copy ${label}`} onClick={copy}>
            Copy
          </button>
        </div>
      </div>
      <pre tabIndex={0} aria-label={label}><code>{code}</code></pre>
    </div>
  );
}
