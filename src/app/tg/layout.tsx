import type { Metadata } from "next";
import { TelegramInit } from "@/components/tg/TelegramInit";

export const metadata: Metadata = { title: "TechStore в Telegram", robots: { index: false } };

// Telegram Mini App shell: no site header/footer, colors come from the Telegram theme (see globals.css).
export default function TgLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="tg-app flex-1 bg-bg">
      <TelegramInit />
      <main className="mx-auto w-full max-w-xl px-4 pb-8 pt-4">{children}</main>
    </div>
  );
}
