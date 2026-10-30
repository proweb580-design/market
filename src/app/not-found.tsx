import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NotFoundContent } from "@/components/NotFoundContent";

// Unmatched URLs render in the root layout only, so this page adds the site chrome itself.
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container-page flex-1 pt-6">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
