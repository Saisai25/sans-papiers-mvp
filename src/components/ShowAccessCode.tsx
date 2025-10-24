"use client";

import { useEffect, useState } from "react";

export function ShowAccessCode({ caseId }: { caseId: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [already, setAlready] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/code/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId }),
        });
        const j = await res.json();
        if (j.ok) {
          setCode(j.code ?? null);
          setAlready(!!j.alreadyAssigned);
        } else {
          setErr(j.error ?? "Erreur");
        }
      } catch {
        setErr("Erreur réseau");
      }
    })();
  }, [caseId]);

  if (err) {
    return <p className="text-sm text-red-600">Impossible d’obtenir le code : {err}</p>;
  }

  if (already) {
    return (
      <p className="text-sm text-gray-600">
        Un code d’accès a déjà été attribué à ce dossier. Si vous l’avez perdu, contactez le support.
      </p>
    );
  }

  if (!code) return <p className="text-sm text-gray-500">Attribution du code…</p>;

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <p className="font-medium">Votre code d’accès (à conserver) :</p>
      <p className="text-2xl font-mono tracking-widest mt-1">{code}</p>
      <p className="text-xs text-gray-600 mt-2">
        Conservez ce code. Il vous permettra de revenir plus tard et de discuter avec l’assistant.
      </p>
    </div>
  );
}
