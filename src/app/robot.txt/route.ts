// src/app/robots.txt/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const body = [
    "User-agent: *",
    "Disallow: /api/",
    "Allow: /",
    ""
  ].join("\n");

  return new NextResponse(body, {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}
