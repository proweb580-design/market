import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { fetchCategories, fetchProducts, type Category, type ProductListItem } from "@/lib/api";
import { useTheme } from "@/lib/theme";

export default function CatalogScreen() {
  const t = useTheme();
  // Fixed width so a lone card in the last row does not stretch: (screen − padding − gap) / 2.
  const cardWidth = (Math.min(useWindowDimensions().width, 640) - 16 * 2 - 12) / 2;
  const [query, setQuery] = useState("");
  const [q, setQ] = useState(""); // debounced query actually sent to the API
  const [category, setCategory] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  // Drops responses of a search the user has already typed past.
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setQ(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    fetchCategories().then(setCategories, () => {});
  }, []);

  const load = useCallback(
    async (nextPage: number) => {
      const id = ++requestId.current;
      setError(false);
      try {
        const res = await fetchProducts({ q, category, page: nextPage });
        if (id !== requestId.current) return;
        setItems((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
        setTotal(res.total);
        setPage(res.page);
        setPageCount(res.pageCount);
      } catch {
        if (id === requestId.current) setError(true);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [q, category],
  );

  useEffect(() => {
    setLoading(true);
    load(1);
  }, [load]);

  const loadMore = () => {
    if (!loading && !error && page < pageCount) {
      setLoading(true);
      load(page + 1);
    }
  };

  const chip = (label: string, value: string | undefined) => {
    const active = category === value;
    return (
      <Pressable
        key={value ?? "all"}
        onPress={() => setCategory(value)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[styles.chip, { borderColor: active ? t.accent : t.line, backgroundColor: active ? t.accent : t.surface }]}
      >
        <Text style={{ color: active ? t.onAccent : t.text, fontSize: 14 }}>{label}</Text>
      </Pressable>
    );
  };

  const header = (
    <View style={styles.header}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск по названию или бренду"
        placeholderTextColor={t.muted}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
        accessibilityLabel="Поиск товаров"
        style={[styles.search, { backgroundColor: t.surface, borderColor: t.line, color: t.text }]}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {chip("Все", undefined)}
        {categories.map((c) => chip(c.name, c.slug))}
      </ScrollView>
      <Text style={{ color: t.muted, fontSize: 13 }} accessibilityLiveRegion="polite">
        {error ? "Не удалось загрузить товары" : loading && items.length === 0 ? "Загрузка…" : total > 0 ? `Найдено: ${total}` : q ? `По запросу «${q}» ничего не найдено` : "Товаров пока нет"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(p) => String(p.id)}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard product={item} />
        </View>
      )}
      ListHeaderComponent={header}
      ListFooterComponent={
        error ? (
          <Pressable onPress={() => load(page === 1 && items.length === 0 ? 1 : page + 1)} style={[styles.retry, { backgroundColor: t.accent }]}>
            <Text style={{ color: t.onAccent, fontWeight: "600" }}>Повторить</Text>
          </Pressable>
        ) : loading ? (
          <ActivityIndicator style={styles.footer} color={t.muted} />
        ) : undefined
      }
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        load(1);
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 24, width: "100%", maxWidth: 640, alignSelf: "center" },
  row: { gap: 12 },
  header: { gap: 12 },
  search: { height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  chips: { gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  footer: { marginVertical: 16 },
  retry: { alignSelf: "center", borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginVertical: 16 },
});
