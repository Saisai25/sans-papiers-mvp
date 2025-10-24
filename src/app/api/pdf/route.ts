// src/app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildPdf } from "@/lib/pdf";
import { getDictionary, type Dict } from "@/i18n/get-dictionary";
import { isLocale, type Locale } from "@/i18n/config";

type AnswerRow = { questionId: string; value: string };

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const caseId = url.searchParams.get("caseId") || "";
    const l = (url.searchParams.get("l") || "fr") as string;
    const locale: Locale = isLocale(l) ? (l as Locale) : "fr";

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "MISSING_CASE_ID" }, { status: 400 });
    }

    const c = await prisma.case.findUnique({
      where: { id: caseId },
      include: { answers: true, decision: true },
    });

    if (!c || c.status !== "paid") {
      return NextResponse.json({ ok: false, error: "NOT_ALLOWED" }, { status: 403 });
    }

    const t: Dict = await getDictionary(locale);

    const pdf = await buildPdf({
      c: {
        id: c.id,
        status: c.status as "draft" | "paid" | "closed",
        createdAt: c.createdAt,
        answers: (c.answers as AnswerRow[]).map((a) => ({
          questionId: a.questionId,
          value: a.value,
        })),
        decision: c.decision
          ? { pathway: c.decision.pathway, citations: c.decision.citations }
          : null,
      },
      t,
    });

    // ✅ Envelopper le Uint8Array dans un Blob pour satisfaire BodyInit
    const blob = new Blob([pdf], { type: "application/pdf" });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="decision-${c.id}.pdf"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "PDF_FAILED" }, { status: 500 });
  }
}






