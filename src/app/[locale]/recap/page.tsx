// src/app/[locale]/recap/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PayButton } from "@/components/PayButton";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { getDictionary, type Dict } from "@/i18n/get-dictionary";
import { isLocale, type Locale } from "@/i18n/config";

type AnswerRow = { questionId: string; value: string };

export default async function RecapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ caseId?: string }>;
}) {
  // Locale + dico
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "fr";
  const t: Dict = await getDictionary(l);

  // caseId
  const { caseId } = await searchParams;
  if (!caseId) notFound();

  const c = await prisma.case.findUnique({
    where: { id: caseId },
    include: { decision: true, answers: true },
  });
  if (!c) notFound();

  // ✅ Typage explicite du callback .map
  const answers = (c.answers as Array<{ questionId: string; value: string }>)
  .reduce<Record<string, string>>((acc, a) => {
    acc[a.questionId] = a.value;
    return acc;
  }, {});

  // Parse citations en sécurité
  let citations: string[] = [];
  try {
    citations = c.decision?.citations ? (JSON.parse(c.decision.citations) as string[]) : [];
  } catch {
    citations = [];
  }

  const isWorkPath = (c.decision?.pathway || "").toLowerCase().includes("travail");
  const dept = answers["department"] || "";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">{t.recap.title}</h1>

        <div className="bg-white border rounded-xl p-6 space-y-3">
          <h2 className="font-medium">{t.recap.decision_title}</h2>
          <p className="text-gray-700">
            {t.recap.pathway_prefix}
            <span className="font-semibold">{c.decision?.pathway ?? "—"}</span>
          </p>

          {citations.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {citations.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}

          <div className="pt-3 flex items-center gap-3">
            {c.status === "paid" ? (
              <DownloadPdfButton caseId={caseId} />
            ) : (
              <PayButton caseId={caseId} />
            )}
            <span className="text-sm text-gray-500">
              {t.recap.status_prefix}
              <b>{c.status}</b>
            </span>
          </div>
        </div>

        {/* Encart ressources métiers en tension (après décision “travail”) */}
        {isWorkPath && dept && (
          <div className="bg-white border rounded-xl p-6">
            <h2 className="font-medium mb-2">Ressources — métiers en tension</h2>
            <p className="text-gray-700">
              Votre département : <span className="font-semibold">{dept}</span>
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Consultez la liste actualisée des métiers en tension pour votre département.
            </p>
            <div className="mt-3">
              <a
                href={`/resources/tension?dept=${encodeURIComponent(dept)}`}
                className="inline-block px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
              >
                Voir la liste des métiers en tension
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Astuce : certaines préfectures publient des listes ou pratiques locales.
            </p>
          </div>
        )}

        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-medium mb-2">{t.recap.your_answers}</h2>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
{JSON.stringify(answers, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}





