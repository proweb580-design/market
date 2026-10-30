"use client";

import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Only the parts of Telegram.WebApp this app uses: https://core.telegram.org/bots/webapps
type TelegramWebApp = {
  ready(): void;
  expand(): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
};
declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

// Loads the Telegram SDK and drives the native back button. Outside Telegram the SDK is inert, so /tg also works in a browser.
export function TelegramInit() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!webApp) return;
    if (pathname === "/tg") {
      webApp.BackButton.hide();
      return;
    }
    // Opened straight on a product link there is no history to go back to.
    const back = () => (window.history.length > 1 ? router.back() : router.push("/tg"));
    webApp.BackButton.onClick(back);
    webApp.BackButton.show();
    return () => webApp.BackButton.offClick(back);
  }, [webApp, pathname, router]);

  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="afterInteractive"
      onReady={() => {
        const app = window.Telegram?.WebApp;
        if (!app) return;
        app.ready();
        app.expand();
        setWebApp(app);
      }}
    />
  );
}
