"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addToCartAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";

export function AddToCart({ productId, stock, withQuantity = true }: { productId: number; stock: number; withQuantity?: boolean }) {
  const [state, action, pending] = useActionState(addToCartAction, null);
  if (stock === 0) return <Button disabled className="w-full">Нет в наличии</Button>;
  const max = Math.min(stock, 99); // MAX_LINE_QUANTITY in lib/cart (server-only)
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex gap-2">
        {withQuantity && (
          <>
            <label htmlFor={`qty-${productId}`} className="sr-only">Количество</label>
            <input
              id={`qty-${productId}`}
              name="quantity"
              type="number"
              min={1}
              max={max}
              defaultValue={1}
              inputMode="numeric"
              className="h-11 w-20 rounded-btn border border-line bg-surface px-3 text-sm hover:border-accent/40"
            />
          </>
        )}
        <Button type="submit" loading={pending} className="flex-1">В корзину</Button>
      </div>
      <p aria-live="polite" className={`min-h-5 text-sm ${state?.ok ? "text-success" : "text-danger"}`}>
        {state?.message}
        {state?.ok && <> · <Link href="/cart" className="underline">Перейти</Link></>}
      </p>
    </form>
  );
}
