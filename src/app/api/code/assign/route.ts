import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sha256, generate6DigitCode } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { caseId } = await req.json();
    if (!caseId) {
      return NextResponse.json({ ok: false, error: "MISSING_CASEID" }, { status: 400 });
    }

    const c = await prisma.case.findUnique({ where: { id: caseId } });
    if (!c) return NextResponse.json({ ok: false, error: "CASE_NOT_FOUND" }, { status: 404 });
    if (c.status !== "paid") {
      return NextResponse.json({ ok: false, error: "NOT_PAID" }, { status: 402 });
    }

    // Si déjà un code, on le réutilise (on ne regénère pas pour éviter d’en perdre la trace)
    if (c.codeHash) {
      return NextResponse.json({ ok: true, code: null, alreadyAssigned: true });
    }

    const code = generate6DigitCode();
    await prisma.case.update({
      where: { id: caseId },
      data: { codeHash: sha256(code) },
    });

    // ⚠️ On ne renverra le code en clair **qu'une fois** (juste après paiement)
    return NextResponse.json({ ok: true, code, alreadyAssigned: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "ASSIGN_CODE_FAILED" }, { status: 500 });
  }
}
