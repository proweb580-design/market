import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/CatalogView";
import { getCategoryBySlug, parseCatalogParams } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: category.name, description: category.description ?? undefined } : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/catalog" }, { label: category.name }]} />
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="mt-1 text-muted">{category.description}</p>}
      </div>
      <CatalogView basePath={`/category/${category.slug}`} params={parseCatalogParams(await searchParams)} fixedCategory={category.slug} />
    </div>
  );
}
