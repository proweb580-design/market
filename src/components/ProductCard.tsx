import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { discountPercent, formatUZS } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stock > 0;
  return (
    <article className="group relative flex flex-col">
      <div className="relative flex aspect-square items-center justify-center rounded-card bg-card text-7xl transition-colors group-hover:bg-surface" aria-hidden>
        <span className="transition-transform duration-200 group-hover:scale-105">{product.icon}</span>
        {discount > 0 && (
          <span className="absolute right-2 top-2">
            <Badge tone="accent">−{discount}%</Badge>
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
