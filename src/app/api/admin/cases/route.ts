// src/app/api/admin/cases/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";
    const locale = url.searchParams.get("locale") || "";
    const q = url.searchParams.get("q") || "";
    const code = url.searchParams.get("code") || "";

    // where de base
    const base: Record<string, unknown> = {};
    if (status) base.status = status;
    if (locale) base.locale = locale;
    if (code) base.accessCode = code; // recherche exacte par code d’accès

    // OR pour recherche libre (id / decision.pathway)
    const or: Array<Record<string, unknown>> = [];
    if (q) {
      or.push(
        { id: { contains: q } },
        { decision: { pathway: { contains: q, mode: "insensitive" } } }
      );
    }

    const where = { ...base, ...(or.length ? { OR: or } : {}) };

    const items = await prisma.case.findMany({
      where,
      select: {
        id: true,
        status: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        accessCode: true,
        decision: { select: { pathway: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const mapped = items.map((c) => ({
      id: c.id,
      status: c.status as "draft" | "paid" | "closed",
      locale: c.locale,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      accessCode: c.accessCode ?? null,
      decision: { pathway: c.decision?.pathway ?? null },
    }));

    return NextResponse.json({ ok: true, items: mapped });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "LIST_FAILED" }, { status: 500 });
  }
}




