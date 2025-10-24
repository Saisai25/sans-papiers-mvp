// src/app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCasePdf, type Dict } from "@/lib/pdf";
import { isLocale, type Locale } from "@/i18n/config";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const caseId = sp.get("caseId");
    if (!caseId) {
      return NextResponse.json({ ok: false, error: "NO_CASE_ID" }, { status: 400 });
    }
    const c = await prisma.case.findUnique({
      where: { id: caseId },
      include: { answers: true, decision: true },
    });
    if (!c) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

    const l: Locale = isLocale(c.locale) ? (c.locale as Locale) : "fr";

    const t: Dict = {
      pdf: {
        coverTitle:
          l === "en" ? "Orientation (non-legal advice)" :
          l === "ar" ? "توجيه أولي (ليس استشارة قانونية)" :
          "Orientation (information non juridique)",
        coverSubtitle:
          l === "en" ? "Summary of your situation and references based on your answers." :
          l === "ar" ? "ملخص وضعك والمراجع بناءً على إجاباتك." :
          "Résumé de votre situation et références selon vos réponses.",
        toc: l === "en" ? "Table of contents" : l === "ar" ? "جدول المحتويات" : "Sommaire",
        section_summary: l === "en" ? "Summary" : l === "ar" ? "ملخص" : "Résumé",
        section_legal: l === "en" ? "Legal references" : l === "ar" ? "المراجع القانونية" : "Références légales",
        section_checklist: l === "en" ? "Checklist — documents" : l === "ar" ? "قائمة التحقق — الوثائق" : "Checklist — pièces à réunir",
        section_next: l === "en" ? "Next steps" : l === "ar" ? "الخطوات التالية" : "Les prochaines étapes",
        footer_disclaimer:
          l === "en" ? "Not legal advice — indicative orientation." :
          l === "ar" ? "ليس استشارة قانونية — توجيه إرشادي." :
          "Information indicative — n’a pas valeur de conseil juridique.",
        next_steps:
          l === "en"
            ? [
                "Book an appointment with a lawyer or association.",
                "Gather the listed documents.",
                "Check prefecture’s local rules (if any).",
              ]
            : l === "ar"
            ? [
                "احجز موعداً مع محامٍ أو جمعية مختصة.",
                "اجمع الوثائق المذكورة.",
                "تحقق من التعليمات المحلية لدى المحافظة (إن وُجدت).",
              ]
            : [
                "Prendre contact avec un avocat / une association.",
                "Rassembler les pièces listées.",
                "Vérifier les éventuelles consignes locales de la préfecture.",
              ],
      },
    };

    const bytes = await buildCasePdf({
      c: {
        id: c.id,
        locale: l,
        status: c.status as "draft" | "paid" | "closed",
        createdAt: c.createdAt,
        answers: c.answers.map(a => ({ questionId: a.questionId, value: a.value })),
        decision: c.decision ? { pathway: c.decision.pathway, citations: c.decision.citations } : null,
      },
      t,
    });

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="dossier-${c.id}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "PDF_BUILD_FAILED" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { caseId?: string } | null;
  const url = new URL(req.url);
  url.searchParams.set("caseId", body?.caseId || "");
  return GET(new NextRequest(url));
}




