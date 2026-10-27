import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { toggleCompare, toggleFavorite } from "@/app/actions";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { COMPARE_MAX, FAVORITES_MAX, parseIds } from "@/lib/id-list";
import { ProductCard } from "@/components/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { getProductBySlug, getSimilarProducts } from "@/lib/catalog";
import { discountPercent, formatUZS } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getProductBySlug((await params).slug);
  if (!row) return {};
  const { product } = row;
  return {
    title: `${product.brand} ${product.name}`,
    description: product.shortDescription ?? `${product.name} — ${formatUZS(product.priceUzs)}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const row = await getProductBySlug((await params).slug);
  if (!row) notFound();
  const { product, category } = row;
  const [similar, store] = await Promise.all([getSimilarProducts(product.categoryId, product.id), cookies()]);
  const isFavorite = parseIds(store.get("favorites")?.value, FAVORITES_MAX).includes(product.id);
  const compareIds = parseIds(store.get("compare")?.value, COMPARE_MAX);
  const inCompare = compareIds.includes(product.id);
  const compareFull = !inCompare && compareIds.length >= COMPARE_MAX;
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stockQuantity > 0;
  const specs = Object.entries(product.specifications);
  const [mainImage, ...moreImages] = product.images;

  return (
    <div className="space-y-12">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: category.name, href: `/category/${category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-bento border border-line bg-card">
            {mainImage && (
              <Image src={mainImage} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-10" />
            )}
            {discount > 0 && (
              <span className="absolute right-4 top-4">
                <Badge tone="accent">−{discount}%</Badge>
              </span>
            )}
          </div>
          {moreImages.length > 0 && (
            <ul className="grid grid-cols-4 gap-3">
              {moreImages.map((src, i) => (
                <li key={src} className="relative aspect-square overflow-hidden rounded-card border border-line bg-card">
                  <Image src={src} alt={`${product.name}, фото ${i + 2}`} fill sizes="25vw" className="object-contain p-3" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted">{product.brand}</p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            {product.shortDescription && <p className="mt-3 text-muted">{product.shortDescription}</p>}
          </div>

          <div className="rounded-card border border-line bg-card p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-3xl font-bold">{formatUZS(product.priceUzs)}</p>
              {product.oldPriceUzs && discount > 0 && <p className="text-muted line-through">{formatUZS(product.oldPriceUzs)}</p>}
            </div>
            <p className={`mt-3 text-sm ${inStock ? "text-success" : "text-muted"}`}>
              {inStock ? `В наличии: ${product.stockQuantity} шт.` : "Нет в наличии"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={toggleFavorite}>
                <input type="hidden" name="productId" value={product.id} />
                <Button type="submit" variant="secondary" aria-pressed={isFavorite}>
                  {isFavorite ? "♥ В избранном" : "♡ В избранное"}
                </Button>
              </form>
              <form action={toggleCompare}>
                <input type="hidden" name="productId" value={product.id} />
                <Button type="submit" variant="secondary" aria-pressed={inCompare} disabled={compareFull}>
                  {inCompare ? "⇄ В сравнении" : compareFull ? `Сравнение заполнено (${COMPARE_MAX})` : "⇄ Сравнить"}
                </Button>
              </form>
            </div>
          </div>

          {specs.length > 0 && (
            <section aria-labelledby="specs">
              <h2 id="specs" className="text-lg font-semibold">Характеристики</h2>
              <dl className="mt-3 divide-y divide-line rounded-card border border-line bg-card">
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
              <h2 id="about" className="text-lg font-semibold">Описание</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
            </section>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="space-y-6">
          <h2 id="similar" className="text-2xl font-semibold">Похожие товары</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
