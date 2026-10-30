"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

// Live search: updates ?q= as the user types (debounced), keeping the selected category.
export function TgSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (value.trim() === initial.trim()) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
    }, 300);
    return () => clearTimeout(timer);
  }, [value, initial, searchParams, pathname, router]);

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
      <label htmlFor="tg-q" className="sr-only">
        Поиск товаров
      </label>
      <input
        id="tg-q"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск по названию или бренду"
        enterKeyHint="search"
        className="h-11 w-full rounded-btn border border-line bg-surface px-4 text-sm placeholder:text-muted"
      />
      {pending && (
        <span aria-hidden className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted border-t-transparent" />
      )}
    </form>
  );
}
