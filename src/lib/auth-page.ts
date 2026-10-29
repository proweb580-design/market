import "server-only";
import { redirect } from "next/navigation";
import { googleEnabled } from "@/auth";
import { safeCallbackUrl } from "@/lib/callback-url";
import { currentUserId } from "@/lib/owner";

// Auth.js redirects here with ?error=<code> (cancelled Google sign-in, misconfiguration, ...).
const errors: Record<string, string> = {
  OAuthAccountNotLinked: "Этот email уже зарегистрирован с паролем. Войдите по email и паролю.",
  Configuration: "Вход временно недоступен. Попробуйте позже.",
};

export type AuthSearchParams = Promise<{ callbackUrl?: string; error?: string }>;

// Shared by /login and /register: a signed-in user goes straight to the target page.
export async function authPageProps(searchParams: AuthSearchParams) {
  const { callbackUrl: raw, error } = await searchParams;
  const callbackUrl = safeCallbackUrl(raw);
  if (await currentUserId()) redirect(callbackUrl);
  return {
    callbackUrl,
    googleEnabled,
    error: error ? (errors[error] ?? "Вход не выполнен: он был отменён или произошла ошибка. Попробуйте ещё раз.") : undefined,
  };
}
