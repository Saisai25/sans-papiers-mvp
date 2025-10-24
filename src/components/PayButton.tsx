"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export function PayButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);

  // Récupère la locale depuis l'URL /[locale]/...
  const p = useParams();
  const current =
    typeof p?.locale === "string" ? p.locale : Array.isArray(p?.locale) ? p.locale[0] : "fr";
  const l = ["fr", "en", "ar"].includes(current) ? (current as string) : "fr";

  const onClick = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const j = await res.json();

      if (!j.ok) {
        alert(j.error ?? "Impossible de démarrer le paiement.");
        return;
      }

      // En mode FAKE, l'API renvoie normalement "/success?caseId=..."
      // On préfixe avec /{locale}. Si c'est une URL Stripe absolue, on la laisse telle quelle.
      if (typeof j.url === "string") {
        if (j.url.startsWith("/")) {
          // URL relative -> on ajoute la locale
          window.location.href = `/${l}${j.url}`;
        } else {
          // URL absolue (Stripe)
          window.location.href = j.url;
        }
      } else {
        // Secours : on force la route success localisée
        window.location.href = `/${l}/success?caseId=${caseId}`;
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau pendant l'initialisation du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-50"
      disabled={loading}
    >
      {loading ? "Redirection…" : "Payer"}
    </button>
  );
}

