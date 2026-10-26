import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-bento border border-line bg-gradient-to-br from-accent/25 via-card to-accent-2/15 px-6 py-12 md:px-12 md:py-16">
        <p className="text-sm font-medium text-accent-2">Новинки сезона</p>
        <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-5xl">Техника, которую хочется выбрать сразу</h1>
        <p className="mt-4 max-w-lg text-muted">Смартфоны, ноутбуки и аудио с честными ценами в сумах и доставкой по Ташкенту.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/catalog">Перейти в каталог</LinkButton>
          <LinkButton href="/catalog?sort=discount" variant="secondary">Скидки</LinkButton>
        </div>
        <span aria-hidden className="pointer-events-none absolute -bottom-6 right-4 hidden text-[160px] opacity-80 md:block">📱</span>
      </section>

      {/* Categories */}
      <section aria-labelledby="cats">
        <h2 id="cats" className="text-xl font-semibold">Категории</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="flex items-center gap-3 rounded-card border border-line bg-card p-4 transition-colors hover:border-white/20 hover:bg-surface">
                <span aria-hidden className="text-2xl">{c.icon}</span>
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Bento promo */}
      <section aria-label="Акции" className="grid auto-rows-[minmax(160px,auto)] gap-3 md:grid-cols-4">
        <Link href="/category/laptops" className="flex flex-col justify-end rounded-bento border border-line bg-gradient-to-br from-accent/30 to-card p-6 hover:border-white/20 md:col-span-2 md:row-span-2">
          <span aria-hidden className="mb-auto text-7xl">💻</span>
          <h3 className="mt-6 text-2xl font-bold">Ноутбуки для учёбы и работы</h3>
          <p className="mt-1 text-sm text-muted">Скидки до 15% на MacBook и ультрабуки</p>
        </Link>
        <Link href="/category/headphones" className="flex flex-col justify-between rounded-bento border border-line bg-card p-6 hover:border-white/20 md:col-span-2">
          <span aria-hidden className="text-4xl">🎧</span>
          <div>
            <h3 className="text-lg font-semibold">Звук без проводов</h3>
            <p className="text-sm text-muted">Наушники с шумоподавлением</p>
          </div>
        </Link>
        <Link href="/category/tv" className="flex flex-col justify-between rounded-bento border border-line bg-gradient-to-br from-accent-2/20 to-card p-6 hover:border-white/20">
          <span aria-hidden className="text-4xl">📺</span>
          <h3 className="text-lg font-semibold">OLED-телевизоры</h3>
        </Link>
        <Link href="/compare" className="flex flex-col justify-between rounded-bento border border-line bg-surface p-6 hover:border-white/20">
          <span aria-hidden className="text-4xl">⇄</span>
          <h3 className="text-lg font-semibold">Сравните до 4 моделей</h3>
        </Link>
      </section>

      {/* Popular */}
      <section aria-labelledby="popular">
        <div className="flex items-baseline justify-between">
          <h2 id="popular" className="text-xl font-semibold">Популярные товары</h2>
          <Link href="/catalog" className="text-sm text-accent hover:underline">Все товары →</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
