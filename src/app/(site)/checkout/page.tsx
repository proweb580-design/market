import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { LinkButton } from "@/components/ui/Button";
import { getCart } from "@/lib/cart";
import { formatUZS } from "@/lib/format";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Оформление заказа" };

export default async function Page() {
  const user = await requireUser("/checkout");
  const cart = await getCart({ userId: user.id });

  if (!cart.ok) {
    return (
      <div className="flex flex-col items-center rounded-card border border-line bg-card px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Оформление заказа</h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          {cart.lines.length ? "В корзине есть товары, которых нет в нужном количестве." : "Корзина пуста."}
        </p>
        <LinkButton href={cart.lines.length ? "/cart" : "/catalog"} className="mt-6">
          {cart.lines.length ? "Вернуться в корзину" : "Перейти в каталог"}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Оформление заказа</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <CheckoutForm defaultName={user.name ?? ""} />
        <aside className="h-fit space-y-3 rounded-card border border-line bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Ваш заказ</h2>
          <ul className="space-y-2 text-sm">
            {cart.lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span className="text-muted">{l.brand} {l.name} × {l.quantity}</span>
                <span className="shrink-0 tabular-nums">{formatUZS(l.lineTotalUzs)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <span>Итого</span>
            <span className="text-xl font-bold tabular-nums">{formatUZS(cart.totalUzs)}</span>
          </div>
          <p className="text-xs text-muted">Сумма пересчитывается на сервере по актуальным ценам при создании заказа.</p>
          <Link href="/cart" className="text-sm text-accent underline">Изменить корзину</Link>
        </aside>
      </div>
    </div>
  );
}
