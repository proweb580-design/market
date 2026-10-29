"use client";

import { useActionState, useState } from "react";
import { checkoutAction } from "@/app/order-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState(checkoutAction, null);
  const v = state?.values;
  const e = state?.fieldErrors ?? {};
  const [method, setMethod] = useState(v?.deliveryMethod || "delivery");

  return (
    <form action={action} className="space-y-4 rounded-card border border-line bg-card p-5" noValidate>
      {state?.error && <p role="alert" className="rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}
      <Input label="Имя получателя" name="customerName" autoComplete="name" required maxLength={100} defaultValue={v?.customerName ?? defaultName} error={e.customerName} />
      <Input label="Телефон" name="customerPhone" type="tel" autoComplete="tel" required placeholder="+998 90 123 45 67" defaultValue={v?.customerPhone} error={e.customerPhone} />

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">Способ получения</legend>
        {[
          { value: "delivery", label: "Доставка по Ташкенту", hint: "бесплатно" },
          { value: "pickup", label: "Самовывоз из магазина", hint: "бесплатно" },
        ].map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-3 rounded-btn border border-line bg-surface px-3 py-2.5 has-[:checked]:border-accent">
            <input type="radio" name="deliveryMethod" value={o.value} checked={method === o.value} onChange={() => setMethod(o.value)} className="accent-accent" />
            <span className="flex-1 text-sm">{o.label}</span>
            <span className="text-xs text-muted">{o.hint}</span>
          </label>
        ))}
      </fieldset>

      {method === "delivery" && (
        <Input label="Адрес доставки" name="deliveryAddress" autoComplete="street-address" required maxLength={300} defaultValue={v?.deliveryAddress} error={e.deliveryAddress} />
      )}
      <Input label="Комментарий (необязательно)" name="comment" maxLength={500} defaultValue={v?.comment} error={e.comment} />

      <Button type="submit" loading={pending} className="w-full">Оформить заказ</Button>
      <p className="text-xs text-muted">Оплата картой на следующем шаге. Сайт работает в тестовом режиме — деньги не списываются.</p>
    </form>
  );
}
