import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { TENSION_BY_DEPT, DEFAULT_TENSION_RESOURCE } from "@/data/tension";

// i18n minimal ici pour les libellés
function t(l: "fr" | "en" | "ar") {
  if (l === "en") {
    return {
      title: "Shortage occupations — resources",
      needPaid: "Access restricted. Please complete payment to view this resource.",
      dept: "Department",
      fromAnswers: "Detected from your answers",
      links: "Useful links",
      back: "Back to recap",
    };
  }
  if (l === "ar") {
    return {
      title: "المهن المطلوبة — مصادر",
      needPaid: "الوصول مقيّد. الرجاء إتمام الدفع للاطّلاع على هذه الصفحة.",
      dept: "المقاطعة",
      fromAnswers: "تم تحديدها من إجاباتك",
      links: "روابط مفيدة",
      back: "العودة إلى الملخص",
    };
  }
  return {
    title: "Métiers en tension — ressources",
    needPaid: "Accès restreint. Merci de finaliser le paiement pour accéder à cette ressource.",
    dept: "Département",
    fromAnswers: "Détecté depuis vos réponses",
    links: "Liens utiles",
    back: "Retour au récapitulatif",
  };
}

type Locale = "fr" | "en" | "ar";

export const metadata: Metadata = {
  title: "Ressources — Métiers en tension",
};

export default async function TensionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ caseId?: string; dept?: string }>;
}) {
  const { locale } = await params;
  const l: Locale = (["fr", "en", "ar"] as const).includes(locale as Locale) ? (locale as Locale) : "fr";
  const tt = t(l);

  const { caseId, dept: deptParam } = await searchParams;

  // 1) Un caseId est obligatoire (accès après paiement)
  if (!caseId) notFound();

  // 2) Charger le dossier et vérifier le statut
  const c = await prisma.case.findUnique({
    where: { id: caseId },
    include: { answers: true, decision: true },
  });
  if (!c) notFound();

  if (c.status !== "paid") {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-3">{tt.title}</h1>
          <div className="bg-white border rounded-xl p-6">
            <p className="text-red-600">{tt.needPaid}</p>
            <div className="mt-4">
              <a
                href={`/${l}/recap?caseId=${encodeURIComponent(c.id)}`}
                className="px-3 py-2 rounded border hover:bg-gray-50 inline-block"
              >
                {tt.back}
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3) Déterminer le département : query ?dept=… prioritaire, sinon réponse enregistrée
  const answers = (c.answers as Array<{ questionId: string; value: string }>)
  .reduce<Record<string, string>>((acc, a) => {
    acc[a.questionId] = a.value;
    return acc;
  }, {});

  const dept = (deptParam || answers["work_department"] || answers["department"] || "").trim();

  const resource =
    (dept && TENSION_BY_DEPT[dept]) ? TENSION_BY_DEPT[dept] : DEFAULT_TENSION_RESOURCE;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{tt.title}</h1>
          <p className="text-sm text-gray-500">
            {tt.dept}: <span className="font-medium">{dept || "—"}</span>{" "}
            {dept ? <span className="text-gray-400">({tt.fromAnswers})</span> : null}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-3">
          <h2 className="font-medium">{resource.title}</h2>
          {resource.description && <p className="text-gray-700">{resource.description}</p>}
          <div>
            <p className="text-sm text-gray-600 mb-2">{tt.links}</p>
            <ul className="list-disc pl-5 space-y-1">
              {resource.links.map((lnk, i) => (
                <li key={i}>
                  <a
                    href={lnk.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {lnk.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3">
            <a
              href={`/${l}/recap?caseId=${encodeURIComponent(c.id)}`}
              className="px-3 py-2 rounded border hover:bg-gray-50 inline-block"
            >
              {tt.back}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
