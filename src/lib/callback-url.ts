// Only same-site paths, so ?callbackUrl= cannot send the user to another site.
export function safeCallbackUrl(raw: unknown) {
  return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/account";
}
