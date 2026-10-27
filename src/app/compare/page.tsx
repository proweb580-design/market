import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { toggleCompare } from "@/app/actions";
import { Button, LinkButton } from "@/components/ui/Button";
import { getProductsByIds } from "@/lib/catalog";
import { formatUZS } from "@/lib/format";
import { COMPARE_MAX, parseIds } from "@/lib/id-list";

export const metadata = { title: "Сравнение" };

export default async function Page() {
  const items = await getProductsByIds(parseIds((await cookies()).get("compare")?.value, COMPARE_MAX));

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Сравнение</h1>
        <div className="flex flex-col items-center rounded-card border border-line bg-card px-6 py-16 text-center">
          <p className="text-lg font-semibold">Нет товаров для сравнения</p>
          <p className="mt-2 max-w-sm text-sm text-muted">Добавьте от 2 до {COMPARE_MAX} товаров кнопкой «Сравнить» на странице товара.</p>
          <LinkButton href="/catalog" className="mt-6">Перейти в каталог</LinkButton>
        </div>
      </div>
    );
  }

  const specNames = [...new Set(items.flatMap((p) => Object.keys(p.specifications)))];
  const rows: [string, (p: (typeof items)[number]) => string][] = [
    ["Цена", (p) => formatUZS(p.priceUzs)],
    ["Бренд", (p) => p.brand],
    ["Наличие", (p) => (p.stockQuantity > 0 ? `${p.stockQuantity} шт.` : "Нет в наличии")],
    ...specNames.map((name): [string, (p: (typeof items)[number]) => string] => [name, (p) => p.specifications[name] ?? "—"]),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Сравнение</h1>
      {items.length < 2 && <p className="text-sm text-muted">Добавьте ещё хотя бы один товар, чтобы сравнить.</p>}
      <div className="overflow-x-auto rounded-card border border-line bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">Сравнение характеристик товаров</caption>
          <thead>
            <tr>
              <td className="w-40" />
              {items.map((p) => (
                <th key={p.id} scope="col" className="p-4 text-left align-top font-normal">
                  <div className="relative mb-3 aspect-square w-full max-w-40 overflow-hidden rounded-card bg-surface">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="160px" className="object-contain p-4" />}
                  </div>
                  <Link href={`/product/${p.slug}`} className="font-medium hover:text-accent">{p.name}</Link>
                  <form action={toggleCompare} className="mt-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <Button type="submit" variant="ghost" className="h-9 px-2" aria-label={`Убрать ${p.name} из сравнения`}>
                      ✕ Убрать
                    </Button>
                  </form>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line border-t border-line">
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row" className="p-4 text-left font-normal text-muted">{label}</th>
                {items.map((p) => (
                  <td key={p.id} className="p-4">{value(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
