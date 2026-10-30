import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-accent focus:px-4 focus:py-2">
        Перейти к содержимому
      </a>
      <Header />
      <main id="main" className="container-page flex-1 pt-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
