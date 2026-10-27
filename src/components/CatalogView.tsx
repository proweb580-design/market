import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { getBrands, getCategories, getProducts, SORTS, type CatalogParams } from "@/lib/catalog";

type Category = Awaited<ReturnType<typeof getCategories>>[number];

function buildHref(basePath: string, params: CatalogParams, overrides: Partial<CatalogParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (merged.q) qs.set("q", merged.q);
  if (merged.category) qs.set("category", merged.category);
  merged.brand?.forEach((b) => qs.append("brand", b));
  if (merged.min !== undefined) qs.set("min", String(merged.min));
  if (merged.max !== undefined) qs.set("max", String(merged.max));
  if (merged.stock) qs.set("stock", "1");
  if (merged.sort !== "recommended") qs.set("sort", merged.sort);
  if (merged.page > 1) qs.set("page", String(merged.page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

const fieldClass = "h-10 w-full rounded-btn border border-line bg-surface px-3 text-sm hover:border-white/20";

// Plain GET form: works without JS, and the URL is the single source of filter state.
function FilterForm({ idPrefix, basePath, params, brands, categories }: {
  idPrefix: string;
  basePath: string;
  params: CatalogParams;
  brands: string[];
  categories?: Category[];
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  return (
    <form action={basePath} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={id("q")} className="text-sm text-muted">Поиск</label>
        <input id={id("q")} name="q" type="search" defaultValue={params.q} placeholder="Название или бренд" className={fieldClass} />
      </div>

      {categories && (
        <div className="space-y-1.5">
          <label htmlFor={id("category")} className="text-sm text-muted">Категория</label>
          <select id={id("category")} name="category" defaultValue={params.category ?? ""} className={fieldClass}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {brands.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm text-muted">Бренд</legend>
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="brand" value={b} defaultChecked={params.brand?.includes(b)} className="size-4 accent-accent" />
              {b}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-1.5 text-sm text-muted">Цена, сум</legend>
        <div className="flex gap-2">
          <label className="sr-only" htmlFor={id("min")}>Цена от</label>
          <input id={id("min")} name="min" type="number" min={0} step={1000} inputMode="numeric" placeholder="от" defaultValue={params.min} className={fieldClass} />
          <label className="sr-only" htmlFor={id("max")}>Цена до</label>
          <input id={id("max")} name="max" type="number" min={0} step={1000} inputMode="numeric" placeholder="до" defaultValue={params.max} className={fieldClass} />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="stock" value="1" defaultChecked={!!params.stock} className="size-4 accent-accent" />
        Только в наличии
      </label>

      <div className="space-y-1.5">
        <label htmlFor={id("sort")} className="text-sm text-muted">Сортировка</label>
        <select id={id("sort")} name="sort" defaultValue={params.sort} className={fieldClass}>
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Применить</Button>
        <LinkButton href={basePath} variant="secondary">Сбросить</LinkButton>
      </div>
    </form>
  );
}

function Pagination({ basePath, params, pageCount }: { basePath: string; params: CatalogParams; pageCount: number }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav aria-label="Страницы" className="flex flex-wrap justify-center gap-2">
      {pages.map((p) =>
        p === params.page ? (
          <span key={p} aria-current="page" className="flex size-10 items-center justify-center rounded-btn bg-accent text-sm font-medium text-white">{p}</span>
        ) : (
          <Link key={p} href={buildHref(basePath, params, { page: p })} className="flex size-10 items-center justify-center rounded-btn border border-line bg-card text-sm hover:border-white/20">
            {p}
          </Link>
        ),
      )}
    </nav>
  );
}

// fixedCategory: category pages lock the category via the path, so it stays out of the query string.
export async function CatalogView({ basePath, params, fixedCategory }: { basePath: string; params: CatalogParams; fixedCategory?: string }) {
  if (fixedCategory) params = { ...params, category: undefined };
  const category = fixedCategory ?? params.category;
  const [{ items, total, pageCount }, brands, categories] = await Promise.all([
    getProducts({ ...params, category }),
    getBrands(category),
    fixedCategory ? undefined : getCategories(),
  ]);
  const formProps = { basePath, params, brands, categories };
  const activeFilters = [params.q, params.brand?.length, params.min, params.max, params.stock, params.category].filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-card border border-line bg-card p-5">
          <FilterForm idPrefix="desk" {...formProps} />
        </div>
      </aside>

      <div className="space-y-6">
        <details className="rounded-card border border-line bg-card lg:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium">
            Фильтры и сортировка{activeFilters > 0 && ` (${activeFilters})`}
            <span aria-hidden>▾</span>
          </summary>
          <div className="border-t border-line p-4">
            <FilterForm idPrefix="mob" {...formProps} />
          </div>
        </details>

        <p className="text-sm text-muted" aria-live="polite">
          Найдено товаров: {total}
          {params.q && <> по запросу «{params.q}»</>}
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-card border border-line bg-card px-6 py-16 text-center">
            <p className="text-lg font-semibold">Ничего не найдено</p>
            <p className="mt-2 max-w-sm text-sm text-muted">Попробуйте изменить запрос или убрать часть фильтров.</p>
            <LinkButton href={basePath} variant="secondary" className="mt-6">Сбросить фильтры</LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <Pagination basePath={basePath} params={params} pageCount={pageCount} />
      </div>
    </div>
  );
}
