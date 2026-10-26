// Source of truth for seed data (npm run db:seed).
// shortcut: the home page still reads this file directly, switch it to Neon queries in stage 3 (T030)

export type Category = { slug: string; name: string; icon: string; description: string };

export type Product = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  priceUzs: number;
  oldPriceUzs?: number;
  stock: number;
  icon: string;
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
};

export const categories: Category[] = [
  { slug: "smartphones", name: "Смартфоны", icon: "📱", description: "Флагманы и доступные модели" },
  { slug: "laptops", name: "Ноутбуки", icon: "💻", description: "Для учёбы, работы и игр" },
  { slug: "headphones", name: "Наушники", icon: "🎧", description: "Беспроводные и с шумоподавлением" },
  { slug: "tv", name: "Телевизоры", icon: "📺", description: "OLED, QLED и Smart TV" },
  { slug: "accessories", name: "Аксессуары", icon: "🔌", description: "Зарядки, кабели и чехлы" },
];

export const products: Product[] = [
  {
    slug: "iphone-15-128", name: "iPhone 15 128 ГБ", brand: "Apple", categorySlug: "smartphones",
    priceUzs: 10_990_000, oldPriceUzs: 12_490_000, stock: 7, icon: "📱", featured: true,
    description: "Смартфон с камерой 48 Мп, Dynamic Island и разъёмом USB-C.",
    specs: { "Экран": "6,1\" OLED", "Память": "128 ГБ", "Процессор": "A16 Bionic", "Камера": "48 + 12 Мп", "Аккумулятор": "3349 мА·ч" },
  },
  {
    slug: "galaxy-s24-256", name: "Galaxy S24 256 ГБ", brand: "Samsung", categorySlug: "smartphones",
    priceUzs: 9_490_000, stock: 12, icon: "📱", featured: true,
    description: "Компактный флагман с Galaxy AI и ярким AMOLED-экраном 120 Гц.",
    specs: { "Экран": "6,2\" AMOLED 120 Гц", "Память": "256 ГБ", "Процессор": "Exynos 2400", "Камера": "50 + 12 + 10 Мп", "Аккумулятор": "4000 мА·ч" },
  },
  {
    slug: "xiaomi-14t", name: "Xiaomi 14T 256 ГБ", brand: "Xiaomi", categorySlug: "smartphones",
    priceUzs: 6_790_000, oldPriceUzs: 7_290_000, stock: 9, icon: "📱", featured: true,
    description: "Камера Leica и быстрая зарядка 67 Вт.",
    specs: { "Экран": "6,67\" AMOLED 144 Гц", "Память": "256 ГБ", "Процессор": "Dimensity 8300-Ultra", "Камера": "50 + 50 + 12 Мп", "Аккумулятор": "5000 мА·ч" },
  },
  {
    slug: "redmi-note-13-128", name: "Redmi Note 13 128 ГБ", brand: "Xiaomi", categorySlug: "smartphones",
    priceUzs: 2_590_000, stock: 30, icon: "📱",
    description: "Доступный смартфон с AMOLED-экраном и камерой 108 Мп.",
    specs: { "Экран": "6,67\" AMOLED", "Память": "128 ГБ", "Процессор": "Snapdragon 685", "Камера": "108 + 8 + 2 Мп", "Аккумулятор": "5000 мА·ч" },
  },
  {
    slug: "macbook-air-m3", name: "MacBook Air 13 M3", brand: "Apple", categorySlug: "laptops",
    priceUzs: 15_900_000, oldPriceUzs: 16_900_000, stock: 3, icon: "💻", featured: true,
    description: "Тонкий и тихий ноутбук без вентилятора на чипе M3.",
    specs: { "Экран": "13,6\" Liquid Retina", "Процессор": "Apple M3", "ОЗУ": "8 ГБ", "SSD": "256 ГБ", "Вес": "1,24 кг" },
  },
  {
    slug: "asus-vivobook-15", name: "Vivobook 15 i5", brand: "ASUS", categorySlug: "laptops",
    priceUzs: 6_490_000, stock: 8, icon: "💻",
    description: "Универсальный ноутбук для учёбы и офиса.",
    specs: { "Экран": "15,6\" IPS Full HD", "Процессор": "Intel Core i5-1235U", "ОЗУ": "16 ГБ", "SSD": "512 ГБ", "Вес": "1,7 кг" },
  },
  {
    slug: "lenovo-legion-5", name: "Legion 5 RTX 4060", brand: "Lenovo", categorySlug: "laptops",
    priceUzs: 14_200_000, oldPriceUzs: 15_500_000, stock: 0, icon: "💻",
    description: "Игровой ноутбук с экраном 165 Гц.",
    specs: { "Экран": "16\" IPS 165 Гц", "Процессор": "Ryzen 7 7840HS", "ОЗУ": "16 ГБ", "SSD": "1 ТБ", "Видеокарта": "RTX 4060 8 ГБ" },
  },
  {
    slug: "sony-wh-1000xm5", name: "WH-1000XM5", brand: "Sony", categorySlug: "headphones",
    priceUzs: 4_290_000, stock: 0, icon: "🎧", featured: true,
    description: "Полноразмерные наушники с одним из лучших шумоподавлений.",
    specs: { "Тип": "Полноразмерные", "Подключение": "Bluetooth 5.2", "Шумоподавление": "Активное", "Автономность": "30 ч" },
  },
  {
    slug: "airpods-pro-2", name: "AirPods Pro 2", brand: "Apple", categorySlug: "headphones",
    priceUzs: 3_190_000, stock: 14, icon: "🎧", featured: true,
    description: "Внутриканальные наушники с адаптивным шумоподавлением и USB-C.",
    specs: { "Тип": "Внутриканальные", "Подключение": "Bluetooth 5.3", "Шумоподавление": "Активное", "Автономность": "6 ч (30 ч с кейсом)" },
  },
  {
    slug: "jbl-tune-520bt", name: "Tune 520BT", brand: "JBL", categorySlug: "headphones",
    priceUzs: 590_000, oldPriceUzs: 690_000, stock: 40, icon: "🎧",
    description: "Лёгкие накладные наушники с фирменным звуком JBL Pure Bass.",
    specs: { "Тип": "Накладные", "Подключение": "Bluetooth 5.3", "Шумоподавление": "Нет", "Автономность": "57 ч" },
  },
  {
    slug: "lg-oled-c3-55", name: "OLED C3 55\"", brand: "LG", categorySlug: "tv",
    priceUzs: 17_500_000, oldPriceUzs: 19_900_000, stock: 2, icon: "📺", featured: true,
    description: "OLED-телевизор с идеальным чёрным и частотой 120 Гц.",
    specs: { "Диагональ": "55\"", "Матрица": "OLED", "Разрешение": "4K UHD", "Частота": "120 Гц", "Smart TV": "webOS" },
  },
  {
    slug: "samsung-qled-q60d-50", name: "QLED Q60D 50\"", brand: "Samsung", categorySlug: "tv",
    priceUzs: 6_900_000, stock: 6, icon: "📺",
    description: "Яркий QLED с квантовыми точками и Tizen.",
    specs: { "Диагональ": "50\"", "Матрица": "QLED", "Разрешение": "4K UHD", "Частота": "60 Гц", "Smart TV": "Tizen" },
  },
  {
    slug: "xiaomi-tv-a-43", name: "TV A 43\"", brand: "Xiaomi", categorySlug: "tv",
    priceUzs: 3_290_000, oldPriceUzs: 3_590_000, stock: 15, icon: "📺",
    description: "Недорогой Smart TV на Google TV.",
    specs: { "Диагональ": "43\"", "Матрица": "LED", "Разрешение": "Full HD", "Частота": "60 Гц", "Smart TV": "Google TV" },
  },
  {
    slug: "anker-737-charger", name: "Зарядное 737 120 Вт", brand: "Anker", categorySlug: "accessories",
    priceUzs: 890_000, stock: 25, icon: "🔌", featured: true,
    description: "GaN-зарядка на три порта, заряжает ноутбук и телефон одновременно.",
    specs: { "Мощность": "120 Вт", "Порты": "2× USB-C, 1× USB-A", "Технология": "GaN" },
  },
  {
    slug: "baseus-usb-c-cable-2m", name: "Кабель USB-C 100 Вт 2 м", brand: "Baseus", categorySlug: "accessories",
    priceUzs: 120_000, stock: 100, icon: "🔌",
    description: "Плетёный кабель USB-C — USB-C с поддержкой 100 Вт.",
    specs: { "Длина": "2 м", "Мощность": "100 Вт", "Разъёмы": "USB-C — USB-C" },
  },
  {
    slug: "xiaomi-power-bank-20000", name: "Power Bank 20000 мА·ч", brand: "Xiaomi", categorySlug: "accessories",
    priceUzs: 350_000, oldPriceUzs: 420_000, stock: 0, icon: "🔌",
    description: "Ёмкий внешний аккумулятор с быстрой зарядкой 22,5 Вт.",
    specs: { "Ёмкость": "20000 мА·ч", "Мощность": "22,5 Вт", "Порты": "1× USB-C, 2× USB-A" },
  },
];
