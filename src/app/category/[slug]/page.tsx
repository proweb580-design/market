import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { categories } from "@/lib/mock-data";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  return <ComingSoon title={category.name} stage={3} />;
}
