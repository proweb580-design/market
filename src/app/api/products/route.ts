import { NextResponse, type NextRequest } from "next/server";
import { getProducts, parseCatalogParams } from "@/lib/catalog";

// Public read-only catalog for the Expo app (mobile/). Same params as /catalog: q, category, brand, min, max, stock, sort, page.
export async function GET(request: NextRequest) {
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(request.nextUrl.searchParams.keys())) {
    const values = request.nextUrl.searchParams.getAll(key);
    raw[key] = values.length > 1 ? values : values[0];
  }
  const params = parseCatalogParams(raw);
  const { items, total, pageCount } = await getProducts(params);
  return NextResponse.json({ items, total, page: params.page, pageCount }, { headers: { "Access-Control-Allow-Origin": "*" } });
}
