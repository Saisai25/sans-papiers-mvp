"use client";
import { useState } from "react";

export function AdminCopy({ text, label = "Copier" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } catch {/* noop */}
  }
  return (
    <button
      onClick={copy}
      className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
      title="Copier"
      aria-label="Copier"
    >
      {done ? "Copié ✓" : label}
    </button>
  );
}
