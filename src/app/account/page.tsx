import Link from "next/link";
import { signOutAction } from "@/app/auth-actions";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatUZS } from "@/lib/format";
import { listOrders, paymentLabels } from "@/lib/orders";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Аккаунт" };

const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tashkent" });

export default async function Page() {
  const user = await requireUser("/account");
  const orders = await listOrders(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Аккаунт</h1>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-card p-6">
        <div>
          <p className="text-lg font-semibold">{user.name || "Без имени"}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">Выйти</Button>
        </form>
      </section>
      <section className="rounded-card border border-line bg-card p-6">
        <h2 className="text-xl font-semibold">Мои заказы</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Заказов пока нет.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {orders.map((o) => {
              const payment = paymentLabels[o.paymentStatus as keyof typeof paymentLabels];
              return (
                <li key={o.id}>
                  <Link
                    href={`/checkout/result?order=${encodeURIComponent(o.orderNumber)}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-accent"
                  >
                    <span>
                      <span className="font-mono">{o.orderNumber}</span>
                      <span className="ml-3 text-sm text-muted">{dateFormat.format(o.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Badge tone={payment.tone}>{payment.label}</Badge>
                      <span className="font-semibold tabular-nums">{formatUZS(o.totalUzs)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <LinkButton href="/favorites" variant="secondary">Избранное</LinkButton>
          <LinkButton href="/cart" variant="secondary">Корзина</LinkButton>
        </div>
      </section>
    </div>
  );
}
