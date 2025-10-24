// src/app/api/decision/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluatePathway, type Answers } from "@/domain/decision";

type AnswerRow = { questionId: string; value: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { caseId?: string };
    const caseId = body?.caseId || "";

    if (!caseId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_CASE_ID" },
        { status: 400 }
      );
    }

    const c = await prisma.case.findUnique({
      where: { id: caseId },
      include: { answers: true, decision: true },
    });
    if (!c) {
      return NextResponse.json(
        { ok: false, error: "CASE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // ✅ Construire le dictionnaire des réponses sans `any`
    const dict: Record<string, string> = (c.answers as AnswerRow[]).reduce(
      (acc, a) => {
        acc[a.questionId] = a.value;
        return acc;
      },
      {} as Record<string, string>
    );

    const result = evaluatePathway(dict as Answers);

    await prisma.decision.upsert({
      where: { caseId },
      update: {
        pathway: result.pathway,
        citations: JSON.stringify(result.citations ?? []),
      },
      create: {
        caseId,
        pathway: result.pathway,
        citations: JSON.stringify(result.citations ?? []),
      },
    });

    return NextResponse.json({ ok: true, decision: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "DECISION_FAILED" },
      { status: 500 }
    );
  }
}

