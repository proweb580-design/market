import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatUZS } from "@/lib/format";
import type { ProductListItem } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductListItem }) {
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stockQuantity > 0;
  const image = product.images[0];
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface transition-shadow group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-200 group-hover:scale-105"
          />
        )}
        {discount > 0 && (
          <span className="absolute right-2 top-2">
            <span className="rounded-md bg-accent px-2 py-1 text-xs font-semibold text-white">−{discount}%</span>
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-xs text-muted">{product.brand}</p>
        <h3 className="line-clamp-2 text-sm">
          {/* Stretched link: whole card is clickable, one tab stop */}
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:rounded-card">
            {product.name}
          </Link>
        </h3>
        <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="font-semibold">{formatUZS(product.priceUzs)}</span>
          {product.oldPriceUzs && discount > 0 && <span className="text-xs text-muted line-through">{formatUZS(product.oldPriceUzs)}</span>}
        </p>
        <p className={`text-xs ${inStock ? "text-success" : "text-muted"}`}>{inStock ? "В наличии" : "Нет в наличии"}</p>
      </div>
    </article>
  );
}
