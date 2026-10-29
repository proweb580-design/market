import { ComingSoon } from "@/components/ComingSoon";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Результат оплаты" };

export default async function Page() {
  await requireUser("/checkout/result");
  return <ComingSoon title="Результат оплаты" stage={7} />;
}
