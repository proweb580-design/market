import { LoginForm } from "@/components/AuthForms";
import { authPageProps, type AuthSearchParams } from "@/lib/auth-page";

export const metadata = { title: "Вход" };

export default async function Page({ searchParams }: { searchParams: AuthSearchParams }) {
  return <LoginForm {...await authPageProps(searchParams)} />;
}
