import { LinkButton } from "@/components/ui/Button";

export function NotFoundContent({ homeHref = "/" }: { homeHref?: string }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-muted">Возможно, ссылка устарела или товар больше не продаётся.</p>
      <LinkButton href={homeHref} className="mt-8">На главную</LinkButton>
    </div>
  );
}
