"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkoutSchema, completeTestPayment, createOrder, getOrder } from "@/lib/orders";
import { currentUserId } from "@/lib/owner";
import { stripe, toStripeAmount } from "@/lib/stripe";

export type CheckoutState = { error: string; fieldErrors?: Partial<Record<string, string>>; values?: Record<string, string> } | null;

const resultUrl = (orderNumber: string) => `/checkout/result?order=${encodeURIComponent(orderNumber)}`;

export async function checkoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const userId = await currentUserId();
  if (!userId) redirect("/login?callbackUrl=%2Fcheckout");

  const values = Object.fromEntries(
    ["customerName", "customerPhone", "deliveryMethod", "deliveryAddress", "comment"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: "Проверьте поля формы", fieldErrors, values };
  }

  const result = await createOrder(userId, parsed.data);
  if ("error" in result) return { error: result.error, values };
  revalidatePath("/cart");
  redirect(resultUrl(result.orderNumber));
}

const paymentSchema = z.object({ orderNumber: z.string().min(1).max(40), outcome: z.enum(["success", "failure"]) });

export async function mockPaymentAction(formData: FormData) {
  const userId = await currentUserId();
  const parsed = paymentSchema.safeParse({ orderNumber: formData.get("orderNumber"), outcome: formData.get("outcome") });
  if (!userId || !parsed.success) return;
  // A repeated click on an already finished order changes nothing; the page just shows the stored result.
  await completeTestPayment(userId, parsed.data.orderNumber, parsed.data.outcome);
  revalidatePath("/checkout/result");
  revalidatePath("/account");
}

// Sends the buyer to Stripe's hosted Checkout (test mode): card data never touches this site.
export async function stripeCheckoutAction(formData: FormData) {
  const userId = await currentUserId();
  const orderNumber = paymentSchema.shape.orderNumber.safeParse(formData.get("orderNumber"));
  if (!userId || !orderNumber.success || !stripe) return;
  const order = await getOrder(userId, orderNumber.data);
  if (order?.paymentStatus !== "unpaid") return;

  const back = `${(await headers()).get("origin")}${resultUrl(order.orderNumber)}`;
  let url: string | null;
  try {
    // Amounts come from the order snapshot in the DB, never from the form.
    ({ url } = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.orderNumber,
      metadata: { orderNumber: order.orderNumber, userId }, // userId lets the webhook find the owner
      line_items: order.items.map((i) => ({
        quantity: i.quantity,
        price_data: { currency: "uzs", unit_amount: toStripeAmount(i.unitPriceUzs), product_data: { name: i.productNameSnapshot } },
      })),
      success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: back,
    }));
  } catch (e) {
    console.error("stripe checkout failed", e);
    url = null;
  }
  redirect(url ?? `${resultUrl(order.orderNumber)}&stripe=error`);
}
