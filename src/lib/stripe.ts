import "server-only";
import Stripe from "stripe";
import { completeTestPayment, getOrder } from "@/lib/orders";

const key = process.env.STRIPE_SECRET_KEY;

// Test mode only: a live key is ignored, so real money can never be charged (PRD: no real payments).
export const stripe = key?.startsWith("sk_test_") ? new Stripe(key) : null;

// UZS is a two-decimal currency in Stripe, so amounts go in tiyin.
export const toStripeAmount = (uzs: number) => uzs * 100;

type PaidCheck = Pick<Stripe.Checkout.Session, "payment_status" | "currency" | "amount_total" | "metadata">;

// The session id in the return URL is untrusted: accept it only if Stripe says it paid exactly this order's total.
export function isPaidSession(session: PaidCheck, order: { orderNumber: string; totalUzs: number }) {
  return (
    session.payment_status === "paid" &&
    session.currency === "uzs" &&
    session.amount_total === toStripeAmount(order.totalUzs) &&
    session.metadata?.orderNumber === order.orderNumber
  );
}

// Called when the buyer comes back from Stripe; the order changes only through the owner/unpaid-checked update.
// shortcut: no webhook, so a buyer who closes the tab before the redirect leaves the order unpaid; add a webhook before real use.
export async function confirmStripePayment(userId: string, orderNumber: string, sessionId: string) {
  if (!stripe) return;
  const order = await getOrder(userId, orderNumber);
  if (order?.paymentStatus !== "unpaid") return;
  const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  if (session && isPaidSession(session, order)) await completeTestPayment(userId, orderNumber, "success");
}
