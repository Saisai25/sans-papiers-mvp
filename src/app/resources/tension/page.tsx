import Link from "next/link";
import { prisma } from "@/lib/db";

// Mini dataset démo (remplaçable plus tard par une vraie source)
const tensionByDept: Record<string, string[]> = {
  "75": ["Développeur", "Infirmier", "Plombier", "Couvreur"],
  "93": ["Carreleur", "Soudeur", "Agent de propreté", "Cuisinier"],
};

export default async function TensionPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; caseId?: string; locale?: string }>;
}) {
  // Next 16: searchParams est une Promise
  const { dept, caseId, locale } = await searchParams;

  const d = (dept ?? "").trim();
  const l = (locale ?? "fr").trim() || "fr";
  const list = tensionByDept[d] ?? null;

  // Paywall : si on a un caseId payé -> on montre la liste, sinon teaser
  let isPaid = false;
  if (caseId) {
    const c = await prisma.case.findUnique({
      where: { id: caseId },
      select: { status: true },
    });
    isPaid = c?.status === "paid";
  }

  // ✅ Bouton “Retour au récapitulatif” si on a caseId
  const backHref = caseId ? `/${l}/recap?caseId=${encodeURIComponent(caseId)}` : `/${l}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Métiers en tension</h1>

        {!d ? (
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <p className="text-gray-700">
              Aucun département fourni. Ajoute <code>?dept=75</code> (par exemple) à l’URL.
            </p>
            <div className="pt-4">
              <Link href={backHref} className="text-sm underline text-gray-700">
                Retour
              </Link>
            </div>
          </div>
        ) : isPaid ? (
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <p className="text-gray-700">
              Département : <span className="font-semibold">{d}</span>
            </p>
            {list ? (
              <>
                <p className="text-gray-600 text-sm">
                  Liste indicative (démo). À remplacer par une source officielle / base interne.
                </p>
                <ul className="list-disc pl-5 text-gray-800">
                  {list.map((job) => (
                    <li key={job}>{job}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-700">
                Liste non disponible pour ce département pour l’instant.
              </p>
            )}
            <div className="pt-4 flex items-center gap-3">
              <Link
                href={backHref}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Retour au récapitulatif
              </Link>
              {!caseId && (
                <Link href={`/${l}`} className="text-sm underline text-gray-700">
                  Accueil
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-6 space-y-3">
            <p className="text-gray-700">
              Département : <span className="font-semibold">{d}</span>
            </p>
            <p className="text-gray-800 font-medium">Ressource disponible après paiement.</p>
            <p className="text-gray-600 text-sm">
              Termine le parcours, règle le paiement et reviens ici via ton récapitulatif.
            </p>
            <div className="pt-4 flex items-center gap-3">
              {/* ✅ Retour au récap si on a le caseId (pas besoin de revenir à l'accueil) */}
              <Link
                href={backHref}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Retour au récapitulatif
              </Link>
              {!caseId && (
                <Link href={`/${l}`} className="text-sm underline text-gray-700">
                  Accueil
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
