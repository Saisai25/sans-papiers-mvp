import { prisma } from "@/lib/db";
import { ShowAccessCode } from "@/components/ShowAccessCode";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string; session_id?: string }>;
}) {
  const { caseId } = await searchParams;

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
        <h1 className="text-2xl font-semibold">Paiement confirmé ✅</h1>
        <p className="text-gray-700">Merci ! (mode démo)</p>

        {caseId && updated?.status === "paid" && (
          <ShowAccessCode caseId={caseId} />
        )}

        <a
          href={`/recap?caseId=${caseId ?? ""}`}
          className="inline-block px-4 py-2 rounded-lg bg-black text-white hover:opacity-90"
        >
          Retourner au récapitulatif
        </a>
        <p className="text-xs text-gray-400">(En prod, on utilisera un webhook Stripe.)</p>
      </div>
    </main>
  );
}

