// Idempotent: re-running updates rows by slug instead of duplicating them.
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { categories as categoryData, products as productData } from "../lib/mock-data";
import photoCredits from "../lib/photo-credits.json";
import { categories, products } from "./schema";

process.loadEnvFile(".env.local");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const insertedCategories = await db
    .insert(categories)
    .values(
      categoryData.map((c, i) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: `/images/categories/${c.slug}.svg`,
        sortOrder: i,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        sortOrder: sql`excluded.sort_order`,
      },
    })
    .returning({ id: categories.id, slug: categories.slug });

  const categoryId = new Map(insertedCategories.map((c) => [c.slug, c.id]));

  await db
    .insert(products)
    .values(
      productData.map((p) => {
        const id = categoryId.get(p.categorySlug);
        if (!id) throw new Error(`Unknown category ${p.categorySlug} for ${p.slug}`);
        return {
          categoryId: id,
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          shortDescription: p.description,
          description: p.description,
          priceUzs: p.priceUzs,
          oldPriceUzs: p.oldPriceUzs ?? null,
          stockQuantity: p.stock,
          // Wikimedia Commons photo when one was found, otherwise the category placeholder.
          images: [photoCredits[p.slug as keyof typeof photoCredits]?.src ?? `/images/categories/${p.categorySlug}.svg`],
          specifications: p.specs,
          isFeatured: p.featured ?? false,
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        categoryId: sql`excluded.category_id`,
        name: sql`excluded.name`,
        brand: sql`excluded.brand`,
        shortDescription: sql`excluded.short_description`,
        description: sql`excluded.description`,
        priceUzs: sql`excluded.price_uzs`,
        oldPriceUzs: sql`excluded.old_price_uzs`,
        stockQuantity: sql`excluded.stock_quantity`,
        images: sql`excluded.images`,
        specifications: sql`excluded.specifications`,
        isFeatured: sql`excluded.is_featured`,
        updatedAt: sql`now()`,
      },
    });

  console.log(`Seeded ${categoryData.length} categories and ${productData.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
