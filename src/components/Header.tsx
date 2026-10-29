import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const nav = [
  { href: "/catalog", label: "Каталог", icon: "grid" },
  { href: "/favorites", label: "Избранное", icon: "heart" },
  { href: "/compare", label: "Сравнение", icon: "compare" },
  { href: "/cart", label: "Корзина", icon: "cart" },
  { href: "/account", label: "Аккаунт", icon: "user" },
] as const;

function SearchForm({ id, className }: { id: string; className: string }) {
  return (
    <form action="/catalog" role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Поиск товаров
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Поиск по названию или бренду"
        className="h-11 w-full rounded-btn border border-line bg-surface px-4 text-sm placeholder:text-muted/70 hover:border-accent/40"
      />
    </form>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Tech<span className="text-accent">Store</span>
        </Link>

        <SearchForm id="q-desktop" className="hidden max-w-xl flex-1 md:block" />

        <nav aria-label="Основная навигация" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex flex-col items-center rounded-btn px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface hover:text-text">
                  <Icon name={item.icon} className="size-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu: <details> works without JS and is keyboard-accessible */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Link href="/cart" className="rounded-btn p-2.5 hover:bg-surface" aria-label="Корзина">
            <Icon name="cart" />
          </Link>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center rounded-btn p-2.5 hover:bg-surface [&::-webkit-details-marker]:hidden" aria-label="Меню">
              <Icon name="menu" className="size-5 group-open:hidden" />
              <Icon name="close" className="hidden size-5 group-open:block" />
            </summary>
            <nav aria-label="Мобильная навигация" className="absolute right-0 top-full mt-2 w-56 rounded-card border border-line bg-card p-2 shadow-xl">
              <ul>
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm hover:bg-surface">
                      <Icon name={item.icon} className="size-5 text-muted" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">
        <SearchForm id="q-mobile" className="w-full" />
      </div>
    </header>
  );
}
