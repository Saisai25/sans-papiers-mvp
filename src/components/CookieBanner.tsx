"use client";

import { useState } from "react";

const KEY = "cookie-consent-v1";

export function CookieBanner({
  locale = "fr",
}: {
  locale?: "fr" | "en" | "ar";
}) {
  // Initialise l’état depuis localStorage au 1er rendu (client component)
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // Affiche si aucune trace de consentement
    return !window.localStorage.getItem(KEY);
  });

  if (!visible) return null;

  const text =
    locale === "en"
      ? {
          msg: "We use essential cookies for the service to work. No advertising cookies.",
          accept: "OK",
          more: "Learn more",
        }
      : locale === "ar"
      ? {
          msg: "نستخدم ملفات تعريف ارتباط أساسية لعمل الخدمة. لا ملفات إعلانية.",
          accept: "موافق",
          more: "المزيد",
        }
      : {
          msg: "Nous utilisons des cookies essentiels au fonctionnement du service. Aucun cookie publicitaire.",
          accept: "OK",
          more: "En savoir plus",
        };

  function accept() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-3xl m-3 rounded-xl border bg-white shadow p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-gray-700">{text.msg}</p>
        <div className="flex gap-2 ml-auto">
          <a
            href="/fr/privacy"
            className="px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
            target="_blank"
            rel="noreferrer"
          >
            {text.more}
          </a>
          <button
            onClick={accept}
            className="px-3 py-1.5 rounded bg-black text-white hover:opacity-90 text-sm"
          >
            {text.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

