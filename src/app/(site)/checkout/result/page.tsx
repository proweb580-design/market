import { notFound } from "next/navigation";
import { mockPaymentAction, stripeCheckoutAction } from "@/app/order-actions";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatUZS } from "@/lib/format";
import { getOrder, paymentLabels } from "@/lib/orders";
import { requireUser } from "@/lib/owner";
import { confirmStripePayment, stripe } from "@/lib/stripe";

export const metadata = { title: "Результат оплаты" };

type Props = { searchParams: Promise<{ order?: string; session_id?: string; stripe?: string }> };

export default async function Page({ searchParams }: Props) {
  const { order: orderNumber = "", session_id: sessionId, stripe: stripeStatus } = await searchParams;
  const user = await requireUser(`/checkout/result?order=${encodeURIComponent(orderNumber)}`);
  if (orderNumber && sessionId) await confirmStripePayment(user.id, orderNumber, sessionId);
  const order = orderNumber ? await getOrder(user.id, orderNumber) : null;
  if (!order) notFound();
  const payment = paymentLabels[order.paymentStatus as keyof typeof paymentLabels];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">Заказ № <span className="font-mono text-text">{order.orderNumber}</span></p>
        <h1 className="text-3xl font-bold">
          {order.paymentStatus === "paid_test" ? "Заказ оплачен" : order.paymentStatus === "failed" ? "Заказ отменён" : "Оплата заказа"}
        </h1>
        <Badge tone={payment.tone}>{payment.label}</Badge>
      </div>

      {order.paymentStatus === "unpaid" && (
        <section className="space-y-4 rounded-card border border-line bg-card p-5">
          {stripe ? (
            <form action={stripeCheckoutAction} className="space-y-4">
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <Button type="submit" className="w-full py-3 text-base">Оплатить {formatUZS(order.totalUzs)}</Button>
              <div className="flex items-center justify-between gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                  Безопасная оплата через Stripe
                </span>
                <span className="flex gap-2">
                  <VisaIcon />
                  <MastercardIcon />
                </span>
              </div>
              <p className="text-xs text-muted">Тестовый режим: карта 4242 4242 4242 4242, любой будущий срок и CVC. Деньги не списываются.</p>
              {stripeStatus === "error" && <p role="alert" className="text-sm text-danger">Не удалось открыть оплату Stripe. Попробуйте ещё раз.</p>}
              {sessionId && <p role="status" className="text-sm text-danger">Оплата не завершена. Можно попробовать снова.</p>}
            </form>
          ) : (
            // Fallback while STRIPE_SECRET_KEY is not set.
            <>
              <p className="text-sm">
                Это <strong>симуляция оплаты</strong>: данные карты не нужны, деньги не списываются. Выберите результат, чтобы проверить сценарий.
              </p>
              <form action={mockPaymentAction} className="flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <Button type="submit" name="outcome" value="success" className="flex-1">Симулировать успешную оплату</Button>
                <Button type="submit" name="outcome" value="failure" variant="secondary" className="flex-1">Симулировать отказ</Button>
              </form>
            </>
          )}
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

const VisaIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-9" role="img" aria-label="Visa">
    <rect width="48" height="32" rx="4" fill="#fff" />
    <text x="24" y="21" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="13" fontStyle="italic" fontWeight="900" fill="#1a1f71">VISA</text>
  </svg>
);

const MastercardIcon = () => (
  <svg viewBox="0 0 48 32" className="h-6 w-9" role="img" aria-label="Mastercard">
    <rect width="48" height="32" rx="4" fill="#fff" />
    <circle cx="19" cy="16" r="9" fill="#eb001b" />
    <circle cx="29" cy="16" r="9" fill="#f79e1b" />
    <path d="M24 8.5a9 9 0 0 1 0 15 9 9 0 0 1 0-15Z" fill="#ff5f00" />
  </svg>
);
