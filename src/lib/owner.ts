import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import type { CartOwner } from "@/lib/cart";
import { getUserFavoriteIds } from "@/lib/favorites";
import { FAVORITES_MAX, parseIds } from "@/lib/id-list";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
} as const;

export const currentUserId = async () => (await auth())?.user?.id;

// Private pages: an absent or expired session goes to /login and comes back afterwards.
export async function requireUser(returnTo: string) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return session.user as typeof session.user & { id: string };
}

// The owner always comes from the session or our own httpOnly cookie, never from the form.
// create=true may set a cookie, so it is only allowed inside server actions.
export async function cartOwner(create: boolean): Promise<CartOwner | undefined> {
  const userId = await currentUserId();
  if (userId) return { userId };
  const store = await cookies();
  const current = store.get("guest_id")?.value;
  if (current && z.uuid().safeParse(current).success) return { guestId: current };
  if (!create) return undefined;
  const guestId = crypto.randomUUID();
  store.set("guest_id", guestId, cookieOptions);
  return { guestId };
}

export async function getFavoriteIds() {
  const userId = await currentUserId();
  if (userId) return getUserFavoriteIds(userId);
  return parseIds((await cookies()).get("favorites")?.value, FAVORITES_MAX);
}
