import Link from "next/link";
import { categories } from "@/lib/mock-data";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold">
            Tech<span className="text-accent">Store</span>
          </p>
          <p className="mt-2 text-sm text-muted">Электроника с доставкой по Ташкенту.</p>
        </div>
        <nav aria-label="Категории">
          <h2 className="text-sm font-semibold">Категории</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-text">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Покупателям">
          <h2 className="text-sm font-semibold">Покупателям</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/cart" className="hover:text-text">Корзина</Link></li>
            <li><Link href="/compare" className="hover:text-text">Сравнение</Link></li>
            <li><Link href="/favorites" className="hover:text-text">Избранное</Link></li>
            <li><Link href="/account" className="hover:text-text">Аккаунт</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-semibold">Контакты</h2>
          <p className="mt-3 text-sm text-muted">Ташкент, Узбекистан</p>
          <p className="mt-2 text-xs text-muted">Оплата на сайте — тестовая симуляция, деньги не списываются.</p>
        </div>
      </div>
      <p className="container-page border-t border-line py-4 text-xs text-muted">© {new Date().getFullYear()} TechStore</p>
    </footer>
  );
}
