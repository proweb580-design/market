"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { googleSignInAction, loginAction, registerAction } from "@/app/auth-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = { callbackUrl: string; googleEnabled: boolean; error?: string };

function Shell({ title, children, footer, googleEnabled, callbackUrl }: Props & { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6 py-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {children}
      {googleEnabled && (
        <>
          <p className="text-center text-sm text-muted">или</p>
          <form action={googleSignInAction}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="secondary" className="w-full">Войти через Google</Button>
          </form>
        </>
      )}
      <p className="text-center text-sm text-muted">{footer}</p>
    </div>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-btn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{message}</p>;
}

const withCallback = (href: string, callbackUrl: string) =>
  callbackUrl === "/account" ? href : `${href}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

export function LoginForm(props: Props) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <Shell
      {...props}
      title="Вход"
      footer={<>Нет аккаунта? <Link href={withCallback("/register", props.callbackUrl)} className="text-accent underline">Зарегистрироваться</Link></>}
    >
      <form action={action} className="space-y-4">
        <FormError message={state?.error ?? props.error} />
        <input type="hidden" name="callbackUrl" value={props.callbackUrl} />
        <Input label="Email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} />
        <Input label="Пароль" name="password" type="password" autoComplete="current-password" required />
        <Button type="submit" loading={pending} className="w-full">Войти</Button>
      </form>
    </Shell>
  );
}

export function RegisterForm(props: Props) {
  const [state, action, pending] = useActionState(registerAction, null);
  return (
    <Shell
      {...props}
      title="Регистрация"
      footer={<>Уже есть аккаунт? <Link href={withCallback("/login", props.callbackUrl)} className="text-accent underline">Войти</Link></>}
    >
      <form action={action} className="space-y-4">
        <FormError message={state?.error ?? props.error} />
        <input type="hidden" name="callbackUrl" value={props.callbackUrl} />
        <Input label="Имя" name="name" autoComplete="name" required maxLength={100} defaultValue={state?.name} />
        <Input label="Email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} />
        <Input label="Пароль (минимум 8 символов)" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} />
        <Button type="submit" loading={pending} className="w-full">Зарегистрироваться</Button>
      </form>
    </Shell>
  );
}
