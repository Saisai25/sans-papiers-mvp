import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // Next 16: params est une Promise
  const l: Locale = isLocale(locale) ? (locale as Locale) : "fr";
  const t = await getDictionary(l);

  const startHref = `/${l}/start`;
  const accessHref = `/${l}/access`;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full py-10">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher current={l} />
        </div>

        <h1 className="text-3xl font-bold mb-3">{t.landing.title}</h1>
        <p className="text-gray-700 mb-6">{t.landing.tagline}</p>

        <div className="bg-white border rounded-xl p-6 shadow-sm mb-4">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            {t.landing.features?.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Link href={startHref} className="px-5 py-3 rounded-lg bg-black text-white hover:opacity-90">
            {t.landing.start}
          </Link>
          <span className="text-gray-500 text-sm">{t.landing.price_hint}</span>
        </div>

        {/* ✅ Lien pour reprendre un dossier existant */}
        <div className="mt-4">
          <Link href={accessHref} className="text-sm underline text-gray-700">
            {t.access.menu_link}
          </Link>
        </div>

        <footer className="mt-10 text-xs text-gray-500">
          {t.landing.legal_hint}
        </footer>
      </div>
    </main>
  );
}


