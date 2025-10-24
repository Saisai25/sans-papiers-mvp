// src/app/api/admin/cases/[id]/access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function assertAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

function genCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // <- Promise ici aussi
) {
  try {
    if (!assertAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await ctx.params; // <- on attend la Promise
    if (!id) {
      return NextResponse.json({ ok: false, error: "BAD_INPUT" }, { status: 400 });
    }

    const code = genCode();

    const updated = await prisma.case.update({
      where: { id },
      data: { accessCode: code },
      select: { id: true, accessCode: true },
    });

    return NextResponse.json({ ok: true, case: updated, code });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "ADMIN_ACCESS_REGEN_FAILED" },
      { status: 500 }
    );
  }
}

