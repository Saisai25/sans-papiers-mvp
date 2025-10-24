"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
      aria-label="Copier le code"
      title="Copier le code"
    >
      {done ? "Copié ✓" : "Copier"}
    </button>
  );
}
