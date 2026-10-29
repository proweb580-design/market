import { stripe, confirmStripePayment } from "@/lib/stripe";

const secret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe calls this after payment; the signature proves the event really came from Stripe.
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!stripe || !secret || !signature) return new Response("Stripe webhook is not configured", { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const { id, metadata } = event.data.object;
    // Re-checked against the order (paid, currency, exact total) inside confirmStripePayment; a DB error throws -> 500 -> Stripe retries.
    if (metadata?.userId && metadata.orderNumber) await confirmStripePayment(metadata.userId, metadata.orderNumber, id);
  }
  return new Response(null, { status: 200 });
}
