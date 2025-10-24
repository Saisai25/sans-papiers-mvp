// src/app/api/admin/export/route.ts
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
    const status = url.searchParams.get("status") || undefined; // optionnel: filtrage par statut
    const locale = url.searchParams.get("locale") || undefined; // optionnel: filtrage par locale

    const items = await prisma.case.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(locale ? { locale } : {}),
      },
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
      take: 2000, // limite large
    });

    const header = [
      "id",
      "status",
      "locale",
      "createdAt",
      "updatedAt",
      "accessCode",
      "decision.pathway",
    ];

    const rows = items.map((c) => [
      c.id,
      c.status,
      c.locale,
      c.createdAt.toISOString(),
      c.updatedAt.toISOString(),
      c.accessCode ?? "",
      c.decision?.pathway ?? "",
    ]);

    const toCsv = (arr: string[][]) =>
      arr
        .map((r) =>
          r
            .map((cell) => {
              const s = (cell ?? "").toString();
              // CSV safe: doublage des guillemets + encadrement si virgule
              const safe = `"${s.replace(/"/g, '""')}"`;
              return safe;
            })
            .join(",")
        )
        .join("\n");

    const csv = toCsv([header, ...rows]);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="cases-export.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "EXPORT_FAILED" }, { status: 500 });
  }
}
