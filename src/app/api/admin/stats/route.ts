// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function assertAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

type StatsPayload = {
  total: number;
  byStatus: Record<string, number>;
  byLocale: Record<string, number>;
};

export async function GET(req: NextRequest) {
  try {
    if (!assertAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    // total
    const total = await prisma.case.count();

    // par statut
    const statusRows = await prisma.case.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const byStatus: Record<string, number> = {};
    for (const r of statusRows) byStatus[r.status] = r._count._all;

    // par locale
    const localeRows = await prisma.case.groupBy({
      by: ["locale"],
      _count: { _all: true },
    });
    const byLocale: Record<string, number> = {};
    for (const r of localeRows) byLocale[r.locale] = r._count._all;

    const payload: StatsPayload = { total, byStatus, byLocale };
    return NextResponse.json({ ok: true, stats: payload });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "ADMIN_STATS_FAILED" }, { status: 500 });
  }
}
