// src/app/api/access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// --- mini rate-limit mémoire: 5 tentatives / 10 minutes / IP ---
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 5;

function getClientIP(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf && xf.length > 0) {
    // format "ip1, ip2, ..."
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const xr = req.headers.get("x-real-ip");
  if (xr && xr.length > 0) return xr.trim();
  // Dev local: fallback
  return "127.0.0.1";
}

function takeSlot(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= MAX_ATTEMPTS) return false;
  b.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    if (!takeSlot(ip)) {
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({} as unknown));
    const code =
      typeof (body as { code?: unknown }).code === "string"
        ? (body as { code: string }).code.trim()
        : "";

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { ok: false, error: "INVALID_CODE" },
        { status: 400 }
      );
    }

    const found = await prisma.case.findFirst({
      where: { accessCode: code },
      select: { id: true },
    });

    if (!found) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, caseId: found.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "ACCESS_FAILED" },
      { status: 500 }
    );
  }
}



