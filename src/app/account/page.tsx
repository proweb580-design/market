import { signOutAction } from "@/app/auth-actions";
import { Button, LinkButton } from "@/components/ui/Button";
import { requireUser } from "@/lib/owner";

export const metadata = { title: "Аккаунт" };

export default async function Page() {
  const user = await requireUser("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Аккаунт</h1>
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-card p-6">
        <div>
          <p className="text-lg font-semibold">{user.name || "Без имени"}</p>
          <p className="text-sm text-muted">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">Выйти</Button>
        </form>
      </section>
      <section className="rounded-card border border-line bg-card p-6">
        <h2 className="text-xl font-semibold">Мои заказы</h2>
        {/* shortcut: order history lands with orders in stage 7 (T075) */}
        <p className="mt-2 text-sm text-muted">Заказов пока нет.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LinkButton href="/favorites" variant="secondary">Избранное</LinkButton>
          <LinkButton href="/cart" variant="secondary">Корзина</LinkButton>
        </div>
      </section>
    </div>
  );
}
