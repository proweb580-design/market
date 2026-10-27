import { cookies } from "next/headers";
import { toggleFavorite } from "@/app/actions";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { Button, LinkButton } from "@/components/ui/Button";
import { getProductsByIds } from "@/lib/catalog";
import { FAVORITES_MAX, parseIds } from "@/lib/id-list";

export const metadata = { title: "Избранное" };

// shortcut: guest favorites live in a cookie; account favorites in Neon arrive with auth (stage 6).
export default async function Page() {
  const ids = parseIds((await cookies()).get("favorites")?.value, FAVORITES_MAX);
  const items = await getProductsByIds(ids);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Избранное</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-card border border-line bg-card px-6 py-16 text-center">
          <p className="text-lg font-semibold">В избранном пока пусто</p>
          <p className="mt-2 max-w-sm text-sm text-muted">Нажмите «В избранное» на странице товара, чтобы сохранить его здесь.</p>
          <LinkButton href="/catalog" className="mt-6">Перейти в каталог</LinkButton>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.id} className="flex flex-col gap-3">
              <ProductCard product={p} />
              <AddToCart productId={p.id} stock={p.stockQuantity} withQuantity={false} />
              <form action={toggleFavorite} className="-mt-2">
                <input type="hidden" name="productId" value={p.id} />
                <Button type="submit" variant="ghost" className="w-full">Удалить</Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
