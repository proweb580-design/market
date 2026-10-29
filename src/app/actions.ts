"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addToCart, MAX_LINE_QUANTITY, removeFromCart, setCartQuantity } from "@/lib/cart";
import { toggleUserFavorite } from "@/lib/favorites";
import { COMPARE_MAX, FAVORITES_MAX, parseIds, serializeIds, toggleId } from "@/lib/id-list";
import { cartOwner, cookieOptions, currentUserId } from "@/lib/owner";

const productIdSchema = z.coerce.number().int().positive();
const quantitySchema = z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY);

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
  const userId = await currentUserId();
  if (!userId) return toggleCookieList("favorites", FAVORITES_MAX, formData);
  const id = productIdSchema.safeParse(formData.get("productId"));
  if (!id.success) return;
  await toggleUserFavorite(userId, id.data);
  revalidatePath("/favorites");
  revalidatePath("/product/[slug]", "page");
}

export type AddToCartState = { ok: boolean; message: string } | null;

export async function addToCartAction(_prev: AddToCartState, formData: FormData): Promise<AddToCartState> {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const quantity = quantitySchema.safeParse(formData.get("quantity") ?? 1);
  if (!productId.success) return { ok: false, message: "Товар не найден" };
  if (!quantity.success) return { ok: false, message: `Количество — от 1 до ${MAX_LINE_QUANTITY}` };
  const result = await addToCart((await cartOwner(true))!, productId.data, quantity.data);
  revalidatePath("/cart");
  return "error" in result ? { ok: false, message: result.error } : { ok: true, message: "Добавлено в корзину" };
}

export async function updateCartQuantity(formData: FormData) {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const quantity = z.coerce.number().int().safeParse(formData.get("quantity"));
  const owner = await cartOwner(false);
  if (!owner || !productId.success || !quantity.success) return;
  await setCartQuantity(owner, productId.data, quantity.data);
  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const productId = productIdSchema.safeParse(formData.get("productId"));
  const owner = await cartOwner(false);
  if (!owner || !productId.success) return;
  await removeFromCart(owner, productId.data);
  revalidatePath("/cart");
}
