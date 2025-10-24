// src/app/[locale]/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DownloadCsvButton } from "@/components/DownloadCsvButton";

type AdminCase = {
  id: string;
  status: "draft" | "paid" | "closed";
  locale: string;
  createdAt: string;
  accessCode?: string | null;
  decision?: { pathway?: string | null } | null;
};

type ListResp = { ok: boolean; items: AdminCase[] };

export default function AdminPage() {
  const p = useParams();
  const l = typeof p?.locale === "string" ? p.locale : "fr";

  const [items, setItems] = useState<AdminCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [locale, setLocale] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [code, setCode] = useState<string>(""); // <-- nouveau: recherche par code

  const adminHeaders = useMemo(
    () => ({
      "content-type": "application/json",
      "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "",
    }),
    []
  );

  async function reload() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (locale) params.set("locale", locale);
      if (query) params.set("q", query);
      if (code) params.set("code", code); // <-- filtre par code d’accès exact

      const res = await fetch(`/api/admin/cases?${params.toString()}`, {
        headers: adminHeaders,
      });
      const json = (await res.json()) as ListResp;
      if (json.ok) setItems(json.items);
      else setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatusFor(id: string, next: "draft" | "paid" | "closed") {
    const prev = items;
    setItems((arr) => arr.map((c) => (c.id === id ? { ...c, status: next } : c)));
    try {
      const res = await fetch(`/api/admin/cases/${id}/status`, {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({ status: next }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error("STATUS_UPDATE_FAILED");
    } catch (e) {
      console.error(e);
      alert("Erreur — statut non mis à jour.");
      setItems(prev);
    }
  }

  async function regenAccessCode(id: string) {
    try {
      const res = await fetch(`/api/admin/cases/${id}/access`, {
        method: "POST",
        headers: adminHeaders,
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error("ACCESS_REGEN_FAILED");
      // rafraîchit la liste
      reload();
      alert(`Nouveau code: ${j.code}`);
    } catch (e) {
      console.error(e);
      alert("Erreur — code non régénéré.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin — dossiers</h1>
          <DownloadCsvButton label="Exporter CSV" status={status || undefined} locale={locale || undefined} />
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Statut</label>
              <select
                className="w-full border rounded px-2 py-1.5"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">(tous)</option>
                <option value="draft">draft</option>
                <option value="paid">paid</option>
                <option value="closed">closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-5 00 mb-1">Locale</label>
              <select
                className="w-full border rounded px-2 py-1.5"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                <option value="">(toutes)</option>
                <option value="fr">fr</option>
                <option value="en">en</option>
                <option value="ar">ar</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Recherche (id / pathway)</label>
              <input
                className="w-full border rounded px-2 py-1.5"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="id, voie..."
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Code d’accès (exact)</label>
              <input
                className="w-full border rounded px-2 py-1.5"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: 123456"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={reload}
              className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
              disabled={loading}
            >
              {loading ? "Chargement..." : "OK"}
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Locale</th>
                <th className="p-3">Créé</th>
                <th className="p-3">Voie</th>
                <th className="p-3">Code</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-mono text-[12px]">{c.id}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-2">
                      <select
                        value={c.status}
                        onChange={(e) =>
                          setStatusFor(c.id, e.target.value as "draft" | "paid" | "closed")
                        }
                        className="border rounded px-2 py-1"
                      >
                        <option value="draft">draft</option>
                        <option value="paid">paid</option>
                        <option value="closed">closed</option>
                      </select>
                    </span>
                  </td>
                  <td className="p-3">{c.locale}</td>
                  <td className="p-3">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="p-3">{c.decision?.pathway ?? "—"}</td>
                  <td className="p-3">{c.accessCode ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => regenAccessCode(c.id)}
                        className="px-2 py-1 rounded border hover:bg-gray-50"
                        title="Régénérer le code d’accès"
                      >
                        Code
                      </button>
                      <a
                        className="px-2 py-1 rounded border hover:bg-gray-50"
                        href={`/${l}/access?code=${encodeURIComponent(c.accessCode || "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ouvrir accès
                      </a>
                      <a
                        className="px-2 py-1 rounded border hover:bg-gray-50"
                        href={`/${l}/recap?caseId=${encodeURIComponent(c.id)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ouvrir récap
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>
                    Aucun dossier
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}



