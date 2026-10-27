import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CatalogView } from "@/components/CatalogView";
import { parseCatalogParams } from "@/lib/catalog";

export const metadata: Metadata = { title: "Каталог", description: "Все товары TechStore: поиск, фильтры и сортировка." };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = parseCatalogParams(await searchParams);
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
      <h1 className="text-3xl font-bold">Каталог</h1>
      <CatalogView basePath="/catalog" params={params} />
    </div>
  );
}
