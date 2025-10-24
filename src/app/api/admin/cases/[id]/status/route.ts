// src/app/api/admin/cases/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function assertAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // <- params est une Promise en Next 16
) {
  try {
    if (!assertAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { id } = await ctx.params; // <- on attend la Promise
    const body = (await req.json()) as { status?: string };
    const status = body?.status;

    if (!id || !status || !["draft", "paid", "closed"].includes(status)) {
      return NextResponse.json({ ok: false, error: "BAD_INPUT" }, { status: 400 });
    }

    const updated = await prisma.case.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ ok: true, case: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "ADMIN_STATUS_UPDATE_FAILED" },
      { status: 500 }
    );
  }
}

