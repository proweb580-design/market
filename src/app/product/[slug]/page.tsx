import { notFound } from "next/navigation";
import { ComingSoon } from "@/components/ComingSoon";
import { products } from "@/lib/mock-data";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  return <ComingSoon title={product.name} stage={3} />;
}
