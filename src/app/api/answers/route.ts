// src/app/api/answers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  caseId: z.string(),
  answers: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.parse(await req.json());
    const { caseId, answers } = parsed;

    // On remplace tout (simple pour MVP)
    await prisma.answer.deleteMany({ where: { caseId } });

    const entries = Object.entries(answers).map(([questionId, value]) => ({
      caseId,
      questionId,
      value,
    }));

    if (entries.length) {
      await prisma.answer.createMany({ data: entries });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "SAVE_ANSWERS_FAILED" },
      { status: 400 }
    );
  }
}
