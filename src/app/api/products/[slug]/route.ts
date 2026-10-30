import { NextResponse } from "next/server";
import photoCredits from "@/lib/photo-credits.json";
import { getProductBySlug } from "@/lib/catalog";

const headers = { "Access-Control-Allow-Origin": "*" };

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const row = await getProductBySlug((await params).slug);
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404, headers });
  const { product, category } = row;
  // CC licenses require attribution wherever the photo is shown, the app included.
  const credit = Object.values(photoCredits).find((c) => c.src === product.images[0]) ?? null;
  return NextResponse.json(
    {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      shortDescription: product.shortDescription,
      description: product.description,
      priceUzs: product.priceUzs,
      oldPriceUzs: product.oldPriceUzs,
      stockQuantity: product.stockQuantity,
      images: product.images,
      specifications: product.specifications,
      category,
      credit,
    },
    { headers },
  );
}
