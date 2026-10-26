import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: { default: "TechStore — электроника в Ташкенте", template: "%s — TechStore" },
  description: "Смартфоны, ноутбуки, наушники и телевизоры с ценами в сумах.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} flex min-h-dvh flex-col font-sans antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-accent focus:px-4 focus:py-2">
          Перейти к содержимому
        </a>
        <Header />
        <main id="main" className="container-page flex-1 pt-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
