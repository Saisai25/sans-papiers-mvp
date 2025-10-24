// src/app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export async function GET() {
  const urls = [
    `${BASE}/fr`,
    `${BASE}/fr/start`,
    `${BASE}/fr/access`,
    `${BASE}/fr/admin`
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>${u}</loc></url>`).join("") +
    `</urlset>`;

  return new NextResponse(xml, {
    headers: { "content-type": "application/xml; charset=utf-8" }
  });
}
