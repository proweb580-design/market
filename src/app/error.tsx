"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center py-24 text-center">
      <h1 className="text-2xl font-semibold">Что-то пошло не так</h1>
      <p className="mt-2 text-muted">Попробуйте обновить страницу. Если ошибка повторится — зайдите позже.</p>
      <Button onClick={reset} className="mt-8">Попробовать снова</Button>
    </div>
  );
}
