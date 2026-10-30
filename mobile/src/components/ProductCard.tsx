import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl, type ProductListItem } from "@/lib/api";
import { discountPercent, formatUZS } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTheme();
  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stockQuantity > 0;
  const image = product.images[0];

  return (
    <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
      <Pressable style={styles.card} accessibilityLabel={`${product.brand} ${product.name}, ${formatUZS(product.priceUzs)}`}>
        <View style={[styles.imageBox, { backgroundColor: t.surface }]}>
          {image && (
            <Image
              source={imageUrl(image)}
              style={StyleSheet.absoluteFill}
              contentFit={image.endsWith(".svg") ? "contain" : "cover"}
              transition={150}
            />
          )}
          {discount > 0 && (
            <View style={[styles.badge, { backgroundColor: t.accent }]}>
              <Text style={[styles.badgeText, { color: t.onAccent }]}>−{discount}%</Text>
            </View>
          )}
        </View>
        <Text style={[styles.brand, { color: t.muted }]}>{product.brand}</Text>
        <Text style={[styles.name, { color: t.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.price, { color: t.text }]}>{formatUZS(product.priceUzs)}</Text>
        {product.oldPriceUzs && discount > 0 && <Text style={[styles.oldPrice, { color: t.muted }]}>{formatUZS(product.oldPriceUzs)}</Text>}
        <Text style={[styles.stock, { color: inStock ? t.success : t.muted }]}>{inStock ? "В наличии" : "Нет в наличии"}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  imageBox: { aspectRatio: 1, borderRadius: 16, overflow: "hidden", marginBottom: 8 },
  badge: { position: "absolute", top: 8, right: 8, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  brand: { fontSize: 12 },
  name: { fontSize: 14 },
  price: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  oldPrice: { fontSize: 12, textDecorationLine: "line-through" },
  stock: { fontSize: 12 },
});
