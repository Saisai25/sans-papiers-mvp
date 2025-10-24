import type { Metadata } from "next";

type Locale = "fr" | "en" | "ar";

export const metadata: Metadata = {
  title: "Mentions légales",
};

function t(l: Locale) {
  if (l === "en") {
    return {
      title: "Legal notice",
      host: "Hosting",
      editor: "Publisher",
      contact: "Contact",
      content:
        "This website provides general information and an orientation tool. It is not legal advice. For a legal assessment of your situation, consult a lawyer.",
    };
  }
  if (l === "ar") {
    return {
      title: "البيانات القانونية",
      host: "الاستضافة",
      editor: "الناشر",
      contact: "التواصل",
      content:
        "هذا الموقع يقدّم معلومات عامة وأداة توجيه. ليس استشارة قانونية. للحصول على تقييم قانوني، يُنصح باستشارة محامٍ.",
    };
  }
  return {
    title: "Mentions légales",
    host: "Hébergement",
    editor: "Éditeur",
    contact: "Contact",
    content:
      "Ce site fournit des informations générales et un outil d’orientation. Il ne constitue pas un conseil juridique. Pour une appréciation juridique de votre situation, consultez un avocat.",
  };
}

export default async function LegalPage({
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

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <p className="text-gray-700">{tt.content}</p>

          <section>
            <h2 className="font-medium mb-1">{tt.editor}</h2>
            <p className="text-gray-700">
              Nom de l’éditeur : Votre société (ou personne physique) <br />
              Adresse : … <br />
              N° SIREN/SIRET (si applicable) : …
            </p>
          </section>

          <section>
            <h2 className="font-medium mb-1">{tt.host}</h2>
            <p className="text-gray-700">
              Hébergeur : … <br />
              Adresse : … <br />
              Téléphone : …
            </p>
          </section>

          <section>
            <h2 className="font-medium mb-1">{tt.contact}</h2>
            <p className="text-gray-700">
              Email : contact@example.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
