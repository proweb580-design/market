"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { COMPARE_MAX, FAVORITES_MAX, parseIds, serializeIds, toggleId } from "@/lib/id-list";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
} as const;

const productIdSchema = z.coerce.number().int().positive();

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
