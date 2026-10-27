"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addToCart, MAX_LINE_QUANTITY, removeFromCart, setCartQuantity } from "@/lib/cart";
import { COMPARE_MAX, FAVORITES_MAX, parseIds, serializeIds, toggleId } from "@/lib/id-list";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
} as const;

const productIdSchema = z.coerce.number().int().positive();
const quantitySchema = z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY);

async function guestId(create: boolean) {
  const store = await cookies();
  const current = store.get("guest_id")?.value;
  if (current && z.uuid().safeParse(current).success) return current;
  if (!create) return undefined;
  const id = crypto.randomUUID();
  store.set("guest_id", id, cookieOptions);
  return id;
}

async function toggleCookieList(name: string, max: number, formData: FormData) {
  const id = productIdSchema.safeParse(formData.get("productId"));
  if (!id.success) return;
  const store = await cookies();
  store.set(name, serializeIds(toggleId(parseIds(store.get(name)?.value, max), id.data, max)), cookieOptions);
}

export async function toggleCompare(formData: FormData) {
  await toggleCookieList("compare", COMPARE_MAX, formData);
}

export async function toggleFavorite(formData: FormData) {
  await toggleCookieList("favorites", FAVORITES_MAX, formData);
}

export type AddToCartState = { ok: boolean; message: string } | null;

export async function addToCartAction(_prev: AddToCartState, formData: FormData): Promise<AddToCartState> {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const quantity = quantitySchema.safeParse(formData.get("quantity") ?? 1);
  if (!productId.success) return { ok: false, message: "Товар не найден" };
  if (!quantity.success) return { ok: false, message: `Количество — от 1 до ${MAX_LINE_QUANTITY}` };
  const result = await addToCart((await guestId(true))!, productId.data, quantity.data);
  revalidatePath("/cart");
  return "error" in result ? { ok: false, message: result.error } : { ok: true, message: "Добавлено в корзину" };
}

export async function updateCartQuantity(formData: FormData) {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const quantity = z.coerce.number().int().safeParse(formData.get("quantity"));
  const id = await guestId(false);
  if (!id || !productId.success || !quantity.success) return;
  await setCartQuantity(id, productId.data, quantity.data);
  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const id = await guestId(false);
  if (!id || !productId.success) return;
  await removeFromCart(id, productId.data);
  revalidatePath("/cart");
}
