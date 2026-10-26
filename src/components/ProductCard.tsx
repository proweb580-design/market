import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { discountPercent, formatUZS } from "@/lib/format";
import type { Product } from "@/lib/mock-data";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stock > 0;
  return (
    <article className="group relative flex flex-col rounded-card border border-line bg-card p-3 transition-colors hover:border-white/20">
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-surface text-6xl" aria-hidden>
        {product.icon}
        {discount > 0 && (
          <span className="absolute left-2 top-2">
            <Badge tone="danger">−{discount}%</Badge>
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-xs text-muted">{product.brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium">
          {/* Stretched link: whole card is clickable, one tab stop */}
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:rounded-card">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-2">
          {product.oldPriceUzs && discount > 0 && <p className="text-xs text-muted line-through">{formatUZS(product.oldPriceUzs)}</p>}
          <p className="font-semibold">{formatUZS(product.priceUzs)}</p>
          <p className={`mt-1 text-xs ${inStock ? "text-success" : "text-muted"}`}>{inStock ? "В наличии" : "Нет в наличии"}</p>
        </div>
      </div>
    </article>
  );
}
