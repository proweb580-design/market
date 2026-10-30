import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_URL, fetchProduct, imageUrl, type Product } from "@/lib/api";
import { discountPercent, formatUZS } from "@/lib/format";
import { useTheme } from "@/lib/theme";

export default function ProductScreen() {
  const t = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProduct(slug).then(
      (p) => active && setProduct(p),
      (e: Error) => active && setError(e.message === "not_found" ? "Товар не найден или больше не продаётся." : "Не удалось загрузить товар."),
    );
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) return <Text style={[styles.center, { color: t.muted }]}>{error}</Text>;
  if (!product) return <ActivityIndicator style={styles.center} color={t.muted} />;

  const discount = discountPercent(product.priceUzs, product.oldPriceUzs);
  const inStock = product.stockQuantity > 0;
  const specs = Object.entries(product.specifications);
  const image = product.images[0];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: product.category.name }} />

      <View>
        <View style={[styles.imageBox, { backgroundColor: t.surface }]}>
          {image && <Image source={imageUrl(image)} style={StyleSheet.absoluteFill} contentFit={image.endsWith(".svg") ? "contain" : "cover"} accessibilityLabel={product.name} />}
          {discount > 0 && (
            <View style={[styles.badge, { backgroundColor: t.accent }]}>
              <Text style={{ color: t.onAccent, fontWeight: "600" }}>−{discount}%</Text>
            </View>
          )}
        </View>
        {product.credit && (
          // CC licenses require attribution next to the photo.
          <Text style={[styles.small, { color: t.muted, marginTop: 6 }]}>
            Фото: {product.credit.author},{" "}
            <Text style={styles.underline} onPress={() => Linking.openURL(product.credit!.source)}>
              {product.credit.license}
            </Text>
            , Wikimedia Commons
          </Text>
        )}
      </View>

      <View>
        <Text style={{ color: t.muted, fontSize: 14 }}>{product.brand}</Text>
        <Text style={[styles.title, { color: t.text }]}>{product.name}</Text>
        {product.shortDescription && <Text style={{ color: t.muted, fontSize: 14, marginTop: 6 }}>{product.shortDescription}</Text>}
      </View>

      <View style={[styles.box, { backgroundColor: t.surface }]}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: t.text }]}>{formatUZS(product.priceUzs)}</Text>
          {product.oldPriceUzs && discount > 0 && <Text style={{ color: t.muted, textDecorationLine: "line-through" }}>{formatUZS(product.oldPriceUzs)}</Text>}
        </View>
        <Text style={{ color: inStock ? t.success : t.muted, fontSize: 14, marginTop: 6 }}>{inStock ? `В наличии: ${product.stockQuantity} шт.` : "Нет в наличии"}</Text>
        {/* Cart and checkout live on the site: the app only browses. */}
        <Pressable
          onPress={() => Linking.openURL(`${API_URL}/product/${product.slug}`)}
          accessibilityRole="link"
          style={({ pressed }) => [styles.button, { backgroundColor: t.accent, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ color: t.onAccent, fontWeight: "600", fontSize: 15 }}>Купить на сайте</Text>
        </Pressable>
      </View>

      {specs.length > 0 && (
        <View>
          <Text style={[styles.h2, { color: t.text }]}>Характеристики</Text>
          <View style={[styles.box, { backgroundColor: t.surface, padding: 0 }]}>
            {specs.map(([name, value], i) => (
              <View key={name} style={[styles.spec, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.line }]}>
                <Text style={[styles.specCell, { color: t.muted }]}>{name}</Text>
                <Text style={[styles.specCell, { color: t.text }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {product.description && product.description !== product.shortDescription && (
        <View>
          <Text style={[styles.h2, { color: t.text }]}>Описание</Text>
          <Text style={{ color: t.muted, fontSize: 14, lineHeight: 21 }}>{product.description}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, textAlign: "center", marginTop: 48, paddingHorizontal: 16 },
  page: { padding: 16, gap: 20, paddingBottom: 40 },
  imageBox: { aspectRatio: 1, borderRadius: 20, overflow: "hidden" },
  badge: { position: "absolute", top: 12, right: 12, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  small: { fontSize: 12 },
  underline: { textDecorationLine: "underline" },
  title: { fontSize: 24, fontWeight: "700", marginTop: 4 },
  box: { borderRadius: 16, padding: 16 },
  priceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 12 },
  price: { fontSize: 24, fontWeight: "700" },
  button: { marginTop: 16, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  h2: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  spec: { flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  specCell: { flex: 1, fontSize: 14 },
});
