// src/app/api/admin/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function isAdmin(req: NextRequest): boolean {
  const hdr = req.headers.get("x-admin-token") || "";
  const tok = process.env.ADMIN_TOKEN || "";
  return tok.length > 0 && hdr === tok;
}

type Item = {
  id: string;
  status: "draft" | "paid" | "closed" | string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  accessCode: string | null;
  decision: { pathway: string | null } | null;
};

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const locale = url.searchParams.get("locale") || undefined;

    const items = (await prisma.case.findMany({
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
      take: 2000,
    })) as Item[];

    const header = [
      "id",
      "status",
      "locale",
      "createdAt",
      "updatedAt",
      "accessCode",
      "decision.pathway",
    ];

    const rows = items.map((c: Item) => [
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
              return `"${s.replace(/"/g, '""')}"`;
            })
            .join(",")
        )
        .join("\n");

    const csv = toCsv([header, ...(rows as unknown as string[][])]);
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

