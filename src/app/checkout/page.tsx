import { ComingSoon } from "@/components/ComingSoon";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Оформление заказа" };

export default async function Page() {
  await requireUser("/checkout");
  return <ComingSoon title="Оформление заказа" stage={7} />;
}
