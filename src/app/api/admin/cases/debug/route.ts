import { NextResponse } from "next/server";

export async function GET() {
  const v = process.env.ADMIN_TOKEN ?? "";
  return NextResponse.json({
    ok: true,
    hasToken: !!v,
    length: v.length,
    sample: v ? `${v[0]}***${v[v.length - 1]}` : null,
  });
}
