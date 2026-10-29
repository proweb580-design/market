import { describe, expect, it } from "vitest";
import { isPaidSession, toStripeAmount } from "@/lib/stripe";

const order = { orderNumber: "TS-1", totalUzs: 120_000 };
const paid = { payment_status: "paid", currency: "uzs", amount_total: 12_000_000, metadata: { orderNumber: "TS-1" } } as const;

describe("stripe session check", () => {
  it("sends UZS in tiyin", () => {
    expect(toStripeAmount(15_900_000)).toBe(1_590_000_000);
  });

  it("accepts only a paid session for exactly this order and total", () => {
    expect(isPaidSession(paid, order)).toBe(true);
    expect(isPaidSession({ ...paid, payment_status: "unpaid" }, order)).toBe(false);
    expect(isPaidSession({ ...paid, amount_total: 100 }, order)).toBe(false);
    expect(isPaidSession({ ...paid, currency: "usd" }, order)).toBe(false);
    expect(isPaidSession({ ...paid, metadata: { orderNumber: "TS-2" } }, order)).toBe(false); // someone else's session
  });
});
