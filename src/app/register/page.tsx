import { RegisterForm } from "@/components/AuthForms";
import { authPageProps, type AuthSearchParams } from "@/lib/auth-page";

export const metadata = { title: "Регистрация" };

export default async function Page({ searchParams }: { searchParams: AuthSearchParams }) {
  return <RegisterForm {...await authPageProps(searchParams)} />;
}
