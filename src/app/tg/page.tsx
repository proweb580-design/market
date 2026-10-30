import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { TgSearch } from "@/components/tg/TgSearch";
import { getCategories, getProducts, parseCatalogParams, type CatalogParams } from "@/lib/catalog";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function tgHref(params: Pick<CatalogParams, "q" | "category">, page = 1) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `/tg?${s}` : "/tg";
}

const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-4 py-2 text-sm ${active ? "border-accent bg-accent text-white" : "border-line bg-surface"}`;

export default async function TgCatalogPage({ searchParams }: Props) {
  // Only search, category and page: the mini app has no filter panel.
  const { q, category, page } = parseCatalogParams(await searchParams);
  const params = parseCatalogParams({ q, category, page: String(page) });
  const [{ items, total, pageCount }, categories] = await Promise.all([getProducts(params), getCategories()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">TechStore</h1>
      <Suspense>
        <TgSearch />
      </Suspense>

      <nav aria-label="Категории" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Link href={tgHref({ q })} className={chip(!category)} aria-current={!category ? "page" : undefined}>
          Все
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={tgHref({ q, category: c.slug })} className={chip(category === c.slug)} aria-current={category === c.slug ? "page" : undefined}>
            {c.name}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-muted" aria-live="polite">
        {total > 0 ? `Найдено: ${total}` : q ? `По запросу «${q}» ничего не найдено` : "Товаров пока нет"}
      </p>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} hrefBase="/tg/product" />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Страницы" className="flex items-center justify-between pt-2 text-sm">
          {page > 1 ? <Link href={tgHref(params, page - 1)} className="rounded-btn bg-surface px-4 py-2">← Назад</Link> : <span />}
          <span className="text-muted">
            {page} из {pageCount}
          </span>
          {page < pageCount ? <Link href={tgHref(params, page + 1)} className="rounded-btn bg-surface px-4 py-2">Далее →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
