import { NotFoundContent } from "@/components/NotFoundContent";

// notFound() inside site pages: rendered within (site)/layout.tsx, so header and footer are already there.
export default function NotFound() {
  return <NotFoundContent />;
}
