// Read-only client for the site's JSON API (src/app/api in the Next.js project).
// Override with EXPO_PUBLIC_API_URL, e.g. http://192.168.1.10:3000 against a local `npm run dev`.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "https://market-56ju.vercel.app").replace(/\/$/, "");

export type ProductListItem = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  priceUzs: number;
  oldPriceUzs: number | null;
  stockQuantity: number;
  images: string[];
};

export type ProductPage = { items: ProductListItem[]; total: number; page: number; pageCount: number };

export type Category = { id: number; slug: string; name: string };

export type Product = ProductListItem & {
  shortDescription: string | null;
  description: string | null;
  specifications: Record<string, string>;
  category: { slug: string; name: string };
  credit: { author: string; license: string; source: string } | null;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(res.status === 404 ? "not_found" : `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchProducts({ q, category, page }: { q?: string; category?: string; page: number }) {
  const qs = new URLSearchParams({ page: String(page) });
  if (q) qs.set("q", q);
  if (category) qs.set("category", category);
  return get<ProductPage>(`/api/products?${qs}`);
}

export const fetchCategories = () => get<Category[]>("/api/categories");

export const fetchProduct = (slug: string) => get<Product>(`/api/products/${encodeURIComponent(slug)}`);

// Product images are site-relative paths like /images/products/x.jpg.
export const imageUrl = (src: string) => (src.startsWith("http") ? src : `${API_URL}${src}`);
