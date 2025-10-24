// src/app/api/decision/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluatePathway, type Answers } from "@/domain/rules";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const caseId = typeof body?.caseId === "string" ? body.caseId : "";
    if (!caseId) {
      return NextResponse.json({ ok: false, error: "MISSING_CASE_ID" }, { status: 400 });
    }

    const c = await prisma.case.findUnique({
      where: { id: caseId },
      include: { answers: true },
    });
    if (!c) return NextResponse.json({ ok: false, error: "CASE_NOT_FOUND" }, { status: 404 });

    const answers: Answers = Object.fromEntries(c.answers.map((a) => [a.questionId, a.value]));
    const result = evaluatePathway(answers);

    await prisma.decision.upsert({
      where: { caseId },
      create: { caseId, pathway: result.pathway, citations: JSON.stringify(result.citations) },
      update: { pathway: result.pathway, citations: JSON.stringify(result.citations) },
    });

    return NextResponse.json({ ok: true, pathway: result.pathway, citations: result.citations });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "DECISION_FAILED" }, { status: 500 });
  }
}

