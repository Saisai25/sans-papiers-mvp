"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

function toLatinDigits(input: string): string {
  // remplace chiffres arabes/indiques par 0-9
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabicIndic = "۰۱۲۳۴۵۶۷۸۹";
  return input
    .split("")
    .map((ch) => {
      const a = arabicIndic.indexOf(ch);
      if (a >= 0) return String(a);
      const b = easternArabicIndic.indexOf(ch);
      if (b >= 0) return String(b);
      return ch;
    })
    .join("");
}

export default function AccessPage() {
  const p = useParams();
  const candidate =
    typeof p?.locale === "string" ? p.locale : Array.isArray(p?.locale) ? p.locale[0] : "fr";
  const l: Locale = isLocale(candidate) ? candidate : "fr";

  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setErr(null);

    // Normaliser l’entrée: convertir chiffres arabes → 0-9, garder uniquement les chiffres.
    const normalized = toLatinDigits(code).replace(/\D+/g, "");

    if (!normalized || normalized.length < 6) {
      setErr(l === "en" ? "Please enter a 6-digit code." :
            l === "ar" ? "يرجى إدخال رمز من 6 أرقام." :
            "Merci de saisir un code à 6 chiffres.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });
      const j: { ok?: boolean; caseId?: string; error?: string } = await res.json();
      if (!res.ok || !j?.ok || !j.caseId) {
        throw new Error(j?.error ?? `HTTP_${res.status}`);
      }
      router.push(`/${l}/recap?caseId=${encodeURIComponent(j.caseId)}`);
    } catch {
      setErr(
        l === "en"
          ? "Invalid code or case not found. Please check and try again."
          : l === "ar"
          ? "رمز غير صالح أو ملف غير موجود. يرجى التحقق والمحاولة مرة أخرى."
          : "Code invalide ou dossier introuvable. Vérifiez et réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  // Mini textes inline (évite tout import serveur ici)
  const t = {
    title: l === "en" ? "Access my case" : l === "ar" ? "الدخول إلى ملفي" : "Accéder à mon dossier",
    subtitle:
      l === "en"
        ? "Enter the 6-digit access code you received."
        : l === "ar"
        ? "أدخل رمز الوصول المكوّن من 6 أرقام الذي حصلت عليه."
        : "Saisissez le code d’accès à 6 chiffres reçu.",
    input_label: l === "en" ? "Access code" : l === "ar" ? "رمز الوصول" : "Code d’accès",
    input_placeholder: l === "en" ? "6 digits…" : l === "ar" ? "٦ أرقام…" : "6 chiffres…",
    submit: l === "en" ? "Open my case" : l === "ar" ? "فتح ملفي" : "Ouvrir mon dossier",
    helper:
      l === "en"
        ? "Tip: keep this code to resume your case later."
        : l === "ar"
        ? "نصيحة: احتفظ بهذا الرمز للعودة لاحقًا إلى ملفك."
        : "Astuce : gardez ce code pour reprendre plus tard.",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-gray-600">{t.subtitle}</p>

        <form onSubmit={submit} className="bg-white border rounded-xl p-6 space-y-3">
          <label className="block text-sm font-medium">{t.input_label}</label>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            className="border rounded-lg px-3 py-2 w-full"
            placeholder={t.input_placeholder}
            value={code}
            onChange={(ev) => setCode(ev.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (l === "en" ? "Checking…" : l === "ar" ? "جارِ التحقق…" : "Vérification…") : t.submit}
          </button>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <p className="text-xs text-gray-500">{t.helper}</p>
        </form>
      </div>
    </main>
  );
}


