// shortcut: static data for the stage 1 UI, replace with Neon queries in stage 2 (T023/T030)

export type Category = { slug: string; name: string; icon: string };

export type Product = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  priceUzs: number;
  oldPriceUzs?: number;
  stock: number;
  icon: string;
};

export const categories: Category[] = [
  { slug: "smartphones", name: "Смартфоны", icon: "📱" },
  { slug: "laptops", name: "Ноутбуки", icon: "💻" },
  { slug: "headphones", name: "Наушники", icon: "🎧" },
  { slug: "tv", name: "Телевизоры", icon: "📺" },
  { slug: "accessories", name: "Аксессуары", icon: "🔌" },
];

export const products: Product[] = [
  { slug: "iphone-15-128", name: "iPhone 15 128 ГБ", brand: "Apple", categorySlug: "smartphones", priceUzs: 10_990_000, oldPriceUzs: 12_490_000, stock: 7, icon: "📱" },
  { slug: "galaxy-s24-256", name: "Galaxy S24 256 ГБ", brand: "Samsung", categorySlug: "smartphones", priceUzs: 9_490_000, stock: 12, icon: "📱" },
  { slug: "macbook-air-m3", name: "MacBook Air 13 M3", brand: "Apple", categorySlug: "laptops", priceUzs: 15_900_000, oldPriceUzs: 16_900_000, stock: 3, icon: "💻" },
  { slug: "sony-wh-1000xm5", name: "WH-1000XM5", brand: "Sony", categorySlug: "headphones", priceUzs: 4_290_000, stock: 0, icon: "🎧" },
  { slug: "lg-oled-c3-55", name: "OLED C3 55\"", brand: "LG", categorySlug: "tv", priceUzs: 17_500_000, oldPriceUzs: 19_900_000, stock: 2, icon: "📺" },
  { slug: "anker-737-charger", name: "Зарядное 737 120 Вт", brand: "Anker", categorySlug: "accessories", priceUzs: 890_000, stock: 25, icon: "🔌" },
  { slug: "xiaomi-14t", name: "Xiaomi 14T 256 ГБ", brand: "Xiaomi", categorySlug: "smartphones", priceUzs: 6_790_000, oldPriceUzs: 7_290_000, stock: 9, icon: "📱" },
  { slug: "airpods-pro-2", name: "AirPods Pro 2", brand: "Apple", categorySlug: "headphones", priceUzs: 3_190_000, stock: 14, icon: "🎧" },
];
