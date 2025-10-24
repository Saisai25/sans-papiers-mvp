import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Génère un code 6 chiffres non utilisé
async function generateAccessCode(): Promise<string> {
  while (true) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await prisma.case.findUnique({
      where: { accessCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const caseId = typeof body?.caseId === "string" ? body.caseId : "";

    if (!caseId) {
      return NextResponse.json({ ok: false, error: "MISSING_CASE_ID" }, { status: 400 });
    }

    const c = await prisma.case.findUnique({ where: { id: caseId } });
    if (!c) {
      return NextResponse.json({ ok: false, error: "CASE_NOT_FOUND" }, { status: 404 });
    }

    // Mode sandbox : on marque payé immédiatement et on assigne un code s'il n'existe pas
    if (process.env.USE_FAKE_PAYMENTS === "1") {
      let code = c.accessCode;
      if (!code) {
        code = await generateAccessCode();
      }
      const updated = await prisma.case.update({
        where: { id: caseId },
        data: { status: "paid", accessCode: code },
        select: { id: true, status: true, accessCode: true },
      });
      return NextResponse.json({ ok: true, case: updated, sandbox: true });
    }

    // Sinon : ici tu mettras la logique Stripe "réelle"
    return NextResponse.json({ ok: false, error: "STRIPE_NOT_CONFIGURED" }, { status: 501 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "CHECKOUT_CREATE_FAILED" }, { status: 500 });
  }
}



