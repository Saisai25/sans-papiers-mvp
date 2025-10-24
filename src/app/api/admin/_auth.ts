import { NextRequest, NextResponse } from "next/server";

export function assertAdmin(req: NextRequest): NextResponse | null {
  const header = req.headers.get("x-admin-token") ?? "";
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (!expected || header !== expected) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }
  return null;
}
