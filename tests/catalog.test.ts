// Runs against the seeded Neon DB (npm run db:seed). Read-only.
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { getBrands, getProductBySlug, getProducts, PAGE_SIZE, parseCatalogParams } from "@/lib/catalog";
import { products as seed } from "@/lib/mock-data";

const query = (raw: Record<string, string | string[]> = {}) => getProducts(parseCatalogParams(raw));

afterAll(() => db.$client.end());

describe("parseCatalogParams", () => {
  it("falls back to defaults on garbage input", () => {
    expect(parseCatalogParams({ sort: "drop table", page: "-3", min: "abc", category: "../x", stock: "yes" })).toEqual({
      q: undefined, category: undefined, brand: undefined, min: undefined, max: undefined, stock: undefined, sort: "recommended", page: 1,
    });
  });

  it("normalizes a single brand to an array", () => {
    expect(parseCatalogParams({ brand: "Apple" }).brand).toEqual(["Apple"]);
  });
});

describe("getProducts", () => {
  it("returns all active products, paginated", async () => {
    const page1 = await query();
    expect(page1.total).toBe(seed.length);
    expect(page1.items).toHaveLength(Math.min(PAGE_SIZE, seed.length));
    const page2 = await query({ page: "2" });
    expect(page2.items).toHaveLength(seed.length - PAGE_SIZE);
    expect(page2.items.map((p) => p.id)).not.toContain(page1.items[0].id);
  });

  it("finds by part of the name, case-insensitive", async () => {
    const { items } = await query({ q: "iphON" });
    expect(items.map((p) => p.slug)).toEqual(["iphone-15-128"]);
  });

  it("finds by brand", async () => {
    const { items } = await query({ q: "sony" });
    expect(items.every((p) => p.brand === "Sony")).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it("treats LIKE wildcards literally", async () => {
    expect((await query({ q: "%" })).total).toBe(0);
  });

  it("sorts by price ascending and descending", async () => {
    const asc = (await query({ sort: "price-asc" })).items.map((p) => p.priceUzs);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = (await query({ sort: "price-desc" })).items.map((p) => p.priceUzs);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("sorts by discount, biggest first", async () => {
    const { items } = await query({ sort: "discount" });
    const pct = items.map((p) => (p.oldPriceUzs && p.oldPriceUzs > p.priceUzs ? 1 - p.priceUzs / p.oldPriceUzs : 0));
    expect(pct).toEqual([...pct].sort((a, b) => b - a));
  });

  it("combines category and price filters", async () => {
    const { items } = await query({ category: "laptops", max: "10000000" });
    const expected = seed.filter((p) => p.categorySlug === "laptops" && p.priceUzs <= 10_000_000).map((p) => p.slug);
    expect(items.map((p) => p.slug).sort()).toEqual(expected.sort());
  });

  it("combines brand, stock and price range", async () => {
    const { items } = await query({ brand: ["Apple", "Xiaomi"], stock: "1", min: "1000000", sort: "price-asc" });
    const expected = seed
      .filter((p) => ["Apple", "Xiaomi"].includes(p.brand) && p.stock > 0 && p.priceUzs >= 1_000_000)
      .sort((a, b) => a.priceUzs - b.priceUzs)
      .map((p) => p.slug);
    expect(items.map((p) => p.slug)).toEqual(expected);
  });

  it("returns an empty result for impossible filters", async () => {
    expect(await query({ min: "50000000" })).toMatchObject({ total: 0, items: [], pageCount: 1 });
  });
});

describe("single product and brands", () => {
  it("opens each product by its own slug and returns null for unknown slugs", async () => {
    expect((await getProductBySlug("macbook-air-m3"))?.product.name).toBe("MacBook Air 13 M3");
    expect(await getProductBySlug("no-such-product")).toBeNull();
  });

  it("lists brands of a category only", async () => {
    expect(await getBrands("tv")).toEqual(["LG", "Samsung", "Xiaomi"]);
  });
});
