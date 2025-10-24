import { prisma } from "@/lib/db";
import Link from "next/link";
import { ShowAccessCode } from "@/components/ShowAccessCode";
import { isLocale, type Locale } from "@/i18n/config";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ caseId?: string; session_id?: string }>;
}) {
  // Locale (server component)
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? (locale as Locale) : "fr";

  const { caseId } = await searchParams;

  // Marque le dossier comme payé (mode FAKE)
  let updated: { id: string; status: string } | null = null;
  if (caseId) {
    updated = await prisma.case.update({
      where: { id: caseId },
      data: { status: "paid" },
      select: { id: true, status: true },
    });
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">
          {l === "fr" && "Paiement confirmé ✅"}
          {l === "en" && "Payment confirmed ✅"}
          {l === "ar" && "تم تأكيد الدفع ✅"}
        </h1>

        <p className="text-gray-700">
          {l === "fr" && "Merci ! (mode démo)"}
          {l === "en" && "Thank you! (demo mode)"}
          {l === "ar" && "شكراً لك! (وضع تجريبي)"}
        </p>

        {/* Affichage / attribution du code d’accès */}
        {caseId ? <ShowAccessCode caseId={caseId} /> : null}

        {updated ? (
          <p className="text-sm text-gray-500">
            {l === "fr" && (
              <>
                Dossier <span className="font-mono">{updated.id}</span> mis à jour : <b>{updated.status}</b>.
              </>
            )}
            {l === "en" && (
              <>
                Case <span className="font-mono">{updated.id}</span> updated: <b>{updated.status}</b>.
              </>
            )}
            {l === "ar" && (
              <>
                تم تحديث الملف <span className="font-mono">{updated.id}</span>: <b>{updated.status}</b>.
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            {l === "fr" && "Identifiant de dossier manquant."}
            {l === "en" && "Missing case identifier."}
            {l === "ar" && "معرّف الملف غير موجود."}
          </p>
        )}

        <Link
          href={`/${l}/recap?caseId=${caseId ?? ""}`}
          className="inline-block px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
        >
          {l === "fr" && "Retourner au récapitulatif"}
          {l === "en" && "Back to summary"}
          {l === "ar" && "العودة إلى الملخص"}
        </Link>

        <p className="text-xs text-gray-400">
          {l === "fr" && "(En prod, on utilisera un webhook Stripe.)"}
          {l === "en" && "(In production, a Stripe webhook will be used.)"}
          {l === "ar" && "(في الإنتاج سنستخدم Webhook من Stripe.)"}
        </p>
      </div>
    </main>
  );
}


