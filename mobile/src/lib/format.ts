// Same output as the site's src/lib/format.ts. Spaces instead of Intl grouping: Hermes on Android may lack ru-RU locale data.
export function formatUZS(amount: number) {
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум`;
}

export function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
