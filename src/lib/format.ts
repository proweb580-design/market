const uzs = new Intl.NumberFormat("ru-RU");

export function formatUZS(amount: number) {
  return `${uzs.format(amount)} сум`;
}

export function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
