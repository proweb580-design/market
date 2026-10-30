import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import photoCredits from "@/lib/photo-credits.json";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProductBySlug } from "@/lib/catalog";
import { discountPercent, formatUZS } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getProductBySlug((await params).slug);
  return row ? { title: `${row.product.brand} ${row.product.name}` } : {};
}

export default async function TgProductPage({ params }: Props) {
  const row = await getProductBySlug((await params).slug);
  if (!row) notFound();
  const { product } = row;
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stockQuantity > 0;
  const specs = Object.entries(product.specifications);
  const mainImage = product.images[0];
  const credit = Object.values(photoCredits).find((c) => c.src === mainImage);

  return (
    <div className="space-y-5">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-bento bg-surface">
          {mainImage && (
            <Image src={mainImage} alt={product.name} fill priority sizes="(min-width: 576px) 576px, 100vw" className={mainImage.endsWith(".svg") ? "object-contain p-10" : "object-cover"} />
          )}
          {discount > 0 && (
            <span className="absolute right-3 top-3">
              <Badge tone="accent">−{discount}%</Badge>
            </span>
          )}
        </div>
        {credit && (
          // CC licenses require attribution next to the photo.
          <p className="mt-2 text-xs text-muted">
            Фото: {credit.author}, <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline">{credit.license}</a>, Wikimedia Commons
          </p>
        )}
      </div>

      <div>
        <p className="text-sm text-muted">{product.brand}</p>
        <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
        {product.shortDescription && <p className="mt-2 text-sm text-muted">{product.shortDescription}</p>}
      </div>

      <div className="rounded-card bg-surface p-4">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="text-2xl font-bold">{formatUZS(product.priceUzs)}</p>
          {product.oldPriceUzs && discount > 0 && <p className="text-sm text-muted line-through">{formatUZS(product.oldPriceUzs)}</p>}
        </div>
        <p className={`mt-2 text-sm ${inStock ? "text-success" : "text-muted"}`}>{inStock ? `В наличии: ${product.stockQuantity} шт.` : "Нет в наличии"}</p>
        {/* Cart and checkout live on the full site; it opens inside the same Telegram window. */}
        <LinkButton href={`/product/${product.slug}`} className="mt-4 w-full">
          Купить на сайте
        </LinkButton>
      </div>

      {specs.length > 0 && (
        <section aria-labelledby="specs">
          <h2 id="specs" className="font-semibold">Характеристики</h2>
          <dl className="mt-2 divide-y divide-line rounded-card bg-surface">
            {specs.map(([name, value]) => (
              <div key={name} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm">
                <dt className="text-muted">{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {product.description && product.description !== product.shortDescription && (
        <section aria-labelledby="about">
          <h2 id="about" className="font-semibold">Описание</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
        </section>
      )}
    </div>
  );
}
