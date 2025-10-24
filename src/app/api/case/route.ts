// src/app/api/case/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { locale = "fr" } = await req.json().catch(() => ({}));
    const c = await prisma.case.create({
      data: { locale, status: "draft" },
      select: { id: true, locale: true, status: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, case: c });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "CREATE_CASE_FAILED" },
      { status: 500 }
    );
  }
}
