import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/app/api/admin/_auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = assertAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const found = await prisma.case.findUnique({ where: { id } });
  if (!found) {
    return NextResponse.json({ ok: false, error: "CASE_NOT_FOUND" }, { status: 404 });
  }

  const updated = await prisma.case.update({
    where: { id },
    data: { status: "paid" },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, case: updated });
}
