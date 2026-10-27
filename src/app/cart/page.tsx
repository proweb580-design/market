import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { removeCartItem, updateCartQuantity } from "@/app/actions";
import { Button, buttonClass, LinkButton } from "@/components/ui/Button";
import { getCart, MAX_LINE_QUANTITY } from "@/lib/cart";
import { formatUZS } from "@/lib/format";

export const metadata = { title: "Корзина" };

export default async function Page() {
  const cart = await getCart((await cookies()).get("guest_id")?.value);

  if (cart.lines.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Корзина</h1>
        <div className="flex flex-col items-center rounded-card border border-line bg-card px-6 py-16 text-center">
          <p className="text-lg font-semibold">Корзина пуста</p>
          <p className="mt-2 max-w-sm text-sm text-muted">Добавьте товары из каталога.</p>
          <LinkButton href="/catalog" className="mt-6">Перейти в каталог</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Корзина</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line rounded-card border border-line bg-card">
          {cart.lines.map((l) => (
            <li key={l.productId} className="flex gap-4 p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-card bg-surface sm:size-24">
                {l.images[0] && <Image src={l.images[0]} alt="" fill sizes="96px" className="object-contain p-2" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted">{l.brand}</p>
                  <Link href={`/product/${l.slug}`} className="font-medium hover:text-accent">{l.name}</Link>
                  <p className="mt-1 text-sm text-muted">{formatUZS(l.priceUzs)} / шт.</p>
                  {l.problem && <p className="mt-1 text-sm text-danger">{l.problem}</p>}
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <form action={updateCartQuantity} className="flex items-center gap-1" aria-label={`Количество: ${l.name}`}>
                    <input type="hidden" name="productId" value={l.productId} />
                    <button
                      name="quantity"
                      value={l.quantity - 1}
                      disabled={l.quantity <= 1}
                      aria-label="Уменьшить"
                      className={buttonClass("secondary", "size-9 px-0")}
                    >
                      −
                    </button>
                    <span className="w-8 text-center tabular-nums" aria-live="polite">{l.quantity}</span>
                    <button
                      name="quantity"
                      value={l.quantity + 1}
                      disabled={l.quantity >= Math.min(l.stockQuantity, MAX_LINE_QUANTITY)}
                      aria-label="Увеличить"
                      className={buttonClass("secondary", "size-9 px-0")}
                    >
                      +
                    </button>
                  </form>
                  <p className="font-semibold tabular-nums">{formatUZS(l.lineTotalUzs)}</p>
                  <form action={removeCartItem}>
                    <input type="hidden" name="productId" value={l.productId} />
                    <Button type="submit" variant="ghost" className="h-9 px-2" aria-label={`Удалить ${l.name}`}>Удалить</Button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 rounded-card border border-line bg-card p-5 lg:sticky lg:top-24">
          <div className="flex justify-between text-sm text-muted">
            <span>Товаров</span>
            <span className="tabular-nums">{cart.itemCount} шт.</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span>Итого</span>
            <span className="text-2xl font-bold tabular-nums">{formatUZS(cart.totalUzs)}</span>
          </div>
          {cart.ok ? (
            <LinkButton href="/checkout" className="w-full">Оформить заказ</LinkButton>
          ) : (
            <>
              <Button disabled className="w-full">Оформить заказ</Button>
              <p className="text-sm text-danger">Уменьшите количество или удалите товары, которых нет в наличии.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
