import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: "TechStore — электроника в Ташкенте", template: "%s — TechStore" },
  description: "Смартфоны, ноутбуки, наушники и телевизоры с ценами в сумах.",
};

// Header and footer live in (site)/layout.tsx so the Telegram Mini App (/tg) can render without them.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} flex min-h-dvh flex-col font-sans antialiased`}>{children}</body>
    </html>
  );
}
