// Only under /catalog: a root loading.tsx streams a 200 before notFound() can set 404 on category/product pages.
export default function Loading() {
  return (
    <div role="status" aria-label="Загрузка" className="animate-pulse space-y-6">
      <div className="h-4 w-48 rounded bg-card" />
      <div className="h-9 w-64 rounded bg-card" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-card bg-card" />
            <div className="h-3 w-1/3 rounded bg-card" />
            <div className="h-4 w-2/3 rounded bg-card" />
          </div>
        ))}
      </div>
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
