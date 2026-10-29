"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkoutSchema, createOrder, mockPayment } from "@/lib/orders";
import { currentUserId } from "@/lib/owner";

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
  await mockPayment(userId, parsed.data.orderNumber, parsed.data.outcome);
  revalidatePath("/checkout/result");
  revalidatePath("/account");
}
