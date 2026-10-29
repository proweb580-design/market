import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { mergeGuestCart } from "@/lib/cart";
import { addUserFavorites } from "@/lib/favorites";
import { FAVORITES_MAX, parseIds } from "@/lib/id-list";
import { verifyPassword } from "@/lib/password";
import { isRateLimited } from "@/lib/rate-limit";

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

const credentialsSchema = z.object({ email: z.email().toLowerCase(), password: z.string().min(1).max(128) });

export const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts }),
  // Credentials provider requires JWT sessions; the token only carries the user id.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        if (isRateLimited(`login:${email}`)) throw new RateLimited();
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    // Not linked to an existing password account with the same email (Auth.js default): emails are not verified on sign-up.
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    // Guest cart and favorites follow the user into the account (T065).
    async signIn({ user }) {
      if (!user.id) return;
      try {
        const store = await cookies();
        const guestId = store.get("guest_id")?.value;
        if (guestId) await mergeGuestCart(guestId, user.id);
        await addUserFavorites(user.id, parseIds(store.get("favorites")?.value, FAVORITES_MAX));
        store.delete("favorites");
      } catch (e) {
        // Merge failure must not block sign-in; the guest data stays in place for the next attempt.
        console.error("guest merge failed", e);
      }
    },
  },
});
