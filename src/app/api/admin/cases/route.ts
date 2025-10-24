// src/app/api/admin/cases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

function assertAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

// Helper CSV (simple, sans any)
function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return `${head}\n${body}\n`;
}

export async function GET(req: NextRequest) {
  try {
    if (!assertAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Filtres
    const status = searchParams.get("status") || undefined;   // draft|paid|closed
    const locale = searchParams.get("locale") || undefined;   // fr|en|ar
    const from = searchParams.get("from") || undefined;       // yyyy-mm-dd
    const to = searchParams.get("to") || undefined;           // yyyy-mm-dd
    const q = searchParams.get("q") || undefined;             // id / accessCode
    const format = searchParams.get("format") || "json";      // json|csv
    const limitParam = Number(searchParams.get("limit") || "200");
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(1, limitParam), 1000) : 200;

    // where typé
    const where: Prisma.CaseWhereInput = {};

    if (status) where.status = status;
    if (locale) where.locale = locale;

    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = new Date(`${from}T00:00:00.000Z`);
      if (to) createdAt.lte = new Date(`${to}T23:59:59.999Z`);
      where.createdAt = createdAt;
    }

    if (q) {
      where.OR = [
        { id: { contains: q } },
        { accessCode: { contains: q } },
      ];
    }

    const items = await prisma.case.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        locale: true,
        status: true,
        accessCode: true,
        createdAt: true,
        updatedAt: true,
        decision: { select: { pathway: true } },
      },
    });

    if (format === "csv") {
      const rows = items.map((c) => ({
        id: c.id,
        locale: c.locale,
        status: c.status,
        accessCode: c.accessCode ?? "",
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        pathway: c.decision?.pathway ?? "",
      }));
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="cases-export.csv"`,
        },
      });
    }

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "ADMIN_LIST_FAILED" }, { status: 500 });
  }
}



