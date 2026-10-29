"use server";

import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { safeCallbackUrl } from "@/lib/callback-url";
import { hashPassword } from "@/lib/password";
import { isRateLimited } from "@/lib/rate-limit";

export type AuthFormState = { error: string; email?: string; name?: string } | null;

const callbackFrom = (formData: FormData) => safeCallbackUrl(formData.get("callbackUrl"));

async function signInWithPassword(email: string, password: string, redirectTo: string): Promise<AuthFormState> {
  try {
    await signIn("credentials", { email, password, redirectTo });
    return null;
  } catch (e) {
    // signIn throws a redirect on success; only Auth.js errors are failures.
    if (e instanceof CredentialsSignin) {
      return { email, error: e.code === "rate_limited" ? "Слишком много попыток. Попробуйте через 15 минут." : "Неверный email или пароль" };
    }
    if (e instanceof AuthError) return { email, error: "Не удалось войти. Попробуйте ещё раз." };
    throw e;
  }
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  return signInWithPassword(email, String(formData.get("password") ?? ""), callbackFrom(formData));
}

const registerSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100, "Имя слишком длинное"),
  email: z.string().trim().toLowerCase().pipe(z.email("Введите корректный email")),
  password: z.string().min(8, "Пароль — минимум 8 символов").max(128, "Пароль — максимум 128 символов"),
});

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const input = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "").trim() };
  const parsed = registerSchema.safeParse({ ...input, password: formData.get("password") });
  if (!parsed.success) return { ...input, error: parsed.error.issues[0].message };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(`register:${ip}`, 5, 60 * 60_000)) return { ...input, error: "Слишком много регистраций. Попробуйте позже." };

  const { name, email, password } = parsed.data;
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  if (!created) return { ...input, error: "Этот email уже зарегистрирован. Войдите или используйте другой." };

  return signInWithPassword(email, password, callbackFrom(formData));
}

export async function googleSignInAction(formData: FormData) {
  await signIn("google", { redirectTo: callbackFrom(formData) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
