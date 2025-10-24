import type { Metadata } from "next";

type Locale = "fr" | "en" | "ar";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

function t(l: Locale) {
  if (l === "en") {
    return {
      title: "Privacy policy",
      intro:
        "This page explains what personal data we process, why, and your rights (GDPR).",
      items: [
        "We collect the answers you submit to generate an orientation.",
        "If you pay, we store the case status and an access code. Payments are processed by a payment provider.",
        "You can request access, rectification, or deletion of your data where applicable.",
      ],
      contact: "For any GDPR request, contact: privacy@example.com",
    };
  }
  if (l === "ar") {
    return {
      title: "سياسة الخصوصية",
      intro:
        "توضح هذه الصفحة البيانات الشخصية التي نعالجها وأسباب ذلك وحقوقك (GDPR).",
      items: [
        "نجمع إجاباتك لإنشاء توجيه أولي.",
        "إذا دفعت، نخزن حالة الملف ورمز الوصول. تتم معالجة الدفعات عبر مزوّد دفع.",
        "يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها حيثما أمكن.",
      ],
      contact: "لطلبات الخصوصية، راسل: privacy@example.com",
    };
  }
  return {
    title: "Politique de confidentialité",
    intro:
      "Cette page explique quelles données personnelles nous traitons, pourquoi, et vos droits (RGPD).",
    items: [
      "Nous collectons les réponses que vous fournissez pour produire une orientation.",
      "En cas de paiement, nous enregistrons le statut du dossier et un code d’accès. Le paiement est traité par un prestataire.",
      "Vous pouvez demander l’accès, la rectification ou la suppression de vos données, lorsque c’est applicable.",
    ],
    contact: "Pour toute demande RGPD : privacy@example.com",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l: Locale = (["fr", "en", "ar"] as const).includes(locale as Locale)
    ? (locale as Locale)
    : "fr";
  const tt = t(l);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">{tt.title}</h1>

        <div className="bg-white border rounded-xl p-6 space-y-3">
          <p className="text-gray-700">{tt.intro}</p>
          <ul className="list-disc pl-5 text-gray-700 space-y-1">
            {tt.items.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <p className="text-gray-700">{tt.contact}</p>
        </div>
      </div>
    </main>
  );
}
