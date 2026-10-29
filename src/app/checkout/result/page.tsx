import { notFound } from "next/navigation";
import { mockPaymentAction } from "@/app/order-actions";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatUZS } from "@/lib/format";
import { getOrder, paymentLabels } from "@/lib/orders";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Результат оплаты" };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function Page({ searchParams }: Props) {
  const { order: orderNumber = "" } = await searchParams;
  const user = await requireUser(`/checkout/result?order=${encodeURIComponent(orderNumber)}`);
  const order = orderNumber ? await getOrder(user.id, orderNumber) : null;
  if (!order) notFound();
  const payment = paymentLabels[order.paymentStatus as keyof typeof paymentLabels];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">Заказ № <span className="font-mono text-text">{order.orderNumber}</span></p>
        <h1 className="text-3xl font-bold">
          {order.paymentStatus === "paid_test" ? "Заказ оплачен" : order.paymentStatus === "failed" ? "Заказ отменён" : "Тестовая оплата"}
        </h1>
        <Badge tone={payment.tone}>{payment.label}</Badge>
      </div>

      {order.paymentStatus === "unpaid" && (
        <section className="space-y-4 rounded-card border border-accent/40 bg-accent/5 p-5">
          <p className="text-sm">
            Это <strong>симуляция оплаты</strong>: данные карты не нужны, деньги не списываются. Выберите результат, чтобы проверить сценарий.
          </p>
          <form action={mockPaymentAction} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="orderNumber" value={order.orderNumber} />
            <Button type="submit" name="outcome" value="success" className="flex-1">Симулировать успешную оплату</Button>
            <Button type="submit" name="outcome" value="failure" variant="secondary" className="flex-1">Симулировать отказ</Button>
          </form>
        </section>
      )}
      {order.paymentStatus === "paid_test" && (
        <p className="rounded-card border border-success/40 bg-success/10 p-4 text-sm">Спасибо! Заказ подтверждён. Это был тестовый платёж — деньги не списаны.</p>
      )}
      {order.paymentStatus === "failed" && (
        <p className="rounded-card border border-danger/40 bg-danger/10 p-4 text-sm">
          Заказ не оплачен и отменён, товары вернулись в продажу. Можно снова добавить их в корзину и оформить новый заказ.
        </p>
      )}

      <section className="rounded-card border border-line bg-card p-5">
        <ul className="divide-y divide-line text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2">
              <span>{i.productNameSnapshot} <span className="text-muted">× {i.quantity} · {formatUZS(i.unitPriceUzs)}</span></span>
              <span className="shrink-0 tabular-nums">{formatUZS(i.lineTotalUzs)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
          <span>Итого</span>
          <span className="text-xl font-bold tabular-nums">{formatUZS(order.totalUzs)}</span>
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">Получатель</dt><dd>{order.customerName}, {order.customerPhone}</dd>
          <dt className="text-muted">Получение</dt><dd>{order.deliveryMethod === "delivery" ? `Доставка: ${order.deliveryAddress}` : "Самовывоз"}</dd>
          {order.comment && (<><dt className="text-muted">Комментарий</dt><dd>{order.comment}</dd></>)}
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <LinkButton href="/account" variant="secondary">Мои заказы</LinkButton>
        <LinkButton href="/catalog" variant="ghost">В каталог</LinkButton>
      </div>
    </div>
  );
}
