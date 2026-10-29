import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { Countdown } from "@/components/Countdown";
import { formatUZS } from "@/lib/format";
import { getCategories, getFeaturedProducts, getProductBySlug } from "@/lib/catalog";
import { Icon } from "@/components/ui/Icon";

function SectionHead({ id, eyebrow, title, action }: { id: string; eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-medium text-accent">
          <span aria-hidden className="flex size-5 items-center justify-center rounded-full bg-accent-2 text-[10px] text-white">★</span>
          {eyebrow}
        </p>
        <h2 id={id} className="mt-1 text-2xl font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Re-read prices and stock from the DB at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories, heroRow] = await Promise.all([getFeaturedProducts(), getCategories(), getProductBySlug("sony-wh-1000xm5")]);
  const hero = heroRow?.product ?? featured[0];

  return (
    <div className="space-y-16">
      {/* Hero: text left, big product with price bubble right */}
      {hero && <section className="relative overflow-hidden rounded-bento bg-hero">
        <div className="grid items-center gap-8 px-6 py-10 md:grid-cols-2 md:px-12 md:py-14">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-danger">
              <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-danger/10"><Icon name="flame" className="size-3.5" /></span>
              Горячее предложение недели
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              {hero.brand} <span className="whitespace-nowrap">{hero.name}</span>
            </h1>
            <p className="mt-3 text-muted">{heroRow?.product.shortDescription ?? "Лучшее предложение недели"}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <LinkButton href={`/product/${hero.slug}`} variant="light" className="px-6">
                <Icon name="cart" className="size-4" /> Купить
              </LinkButton>
              <div className="text-xs text-muted">
                <span className="text-sm text-amber-500" aria-label="Рейтинг 4 из 5">★★★★☆</span>
                <p>100+ отзывов</p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <span aria-hidden className="absolute inset-x-10 inset-y-4 -rotate-6 rounded-bento bg-danger/10" />
            {hero.images[0] && <Image src={hero.images[0]} alt="" width={240} height={240} priority className="relative size-44 rounded-card object-cover shadow-lg md:size-60" />}
            <p className="absolute right-4 top-0 flex size-24 flex-col items-center justify-center rounded-full bg-card px-2 text-center shadow-lg md:right-10">
              <span className="text-[10px] text-muted">от</span>
              <span className="text-[11px] font-bold leading-tight text-accent">{formatUZS(hero.priceUzs)}</span>
            </p>
          </div>
        </div>
      </section>}

      {/* Categories: square tiles, icon above name */}
      <section aria-labelledby="cats" className="space-y-6">
        <SectionHead id="cats" eyebrow="Категории" title="Выберите категорию" />
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-card border border-line bg-card p-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:border-accent/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:aspect-auto sm:py-6"
              >
                {c.imageUrl && (
                  <span className="flex size-14 items-center justify-center rounded-full bg-accent/10">
                    <Image src={c.imageUrl} alt="" width={28} height={28} className="size-7" />
                  </span>
                )}
                <span className="text-xs font-medium sm:text-sm">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Promo bento: big block with countdown + two small tiles */}
      <section aria-label="Акции" className="grid gap-3 md:grid-cols-3">
        <div className="grid items-center gap-6 rounded-bento border border-line bg-surface p-8 sm:grid-cols-[1fr_auto] md:col-span-2 md:p-10">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium text-danger">
              <span aria-hidden className="size-2 rounded-full bg-danger" />
              Не пропустите!
            </p>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Звук, который вы почувствуете</h2>
            <div className="mt-6">
              <Countdown />
            </div>
            <LinkButton href="/category/headphones" className="mt-8">Смотреть</LinkButton>
          </div>
          <span aria-hidden className="hidden size-44 items-center justify-center rounded-full bg-card shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:flex">
            <Image src="/images/categories/headphones.svg" alt="" width={88} height={88} className="size-22" />
          </span>
        </div>
        <div className="grid gap-3">
          <Link href="/category/laptops" className="flex items-center justify-between rounded-bento border border-line bg-gradient-to-br from-accent/25 to-card p-6 hover:border-accent/40">
            <div>
              <h3 className="text-lg font-semibold">Ноутбуки</h3>
              <p className="text-sm text-muted">Скидки до 15%</p>
            </div>
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-card">
              <Image src="/images/categories/laptops.svg" alt="" width={28} height={28} className="size-7" />
            </span>
          </Link>
          <Link href="/category/tv" className="flex items-center justify-between rounded-bento border border-line bg-gradient-to-br from-accent-2/20 to-card p-6 hover:border-accent/40">
            <div>
              <h3 className="text-lg font-semibold">OLED-телевизоры</h3>
              <p className="text-sm text-muted">Глубокий чёрный</p>
            </div>
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-card">
              <Image src="/images/categories/tv.svg" alt="" width={28} height={28} className="size-7" />
            </span>
          </Link>
        </div>
      </section>

      {/* Products */}
      <section aria-labelledby="popular" className="space-y-6">
        <SectionHead id="popular" eyebrow="Наши товары" title="Популярные товары" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="flex justify-center">
          <LinkButton href="/catalog" variant="secondary">Все товары</LinkButton>
        </div>
      </section>
    </div>
  );
}
