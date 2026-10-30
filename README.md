# TechStore

Учебный интернет-магазин электроники для Ташкента: каталог с фильтрами, избранное, сравнение, корзина, вход (email или Google), оформление заказа и **тестовая** оплата. Цены в сумах (UZS).

Стек: Next.js 15 (App Router, Server Actions), Tailwind CSS 4, Drizzle ORM, Neon PostgreSQL, Auth.js, Stripe (только тестовый режим).

## Запуск локально

Нужны Node.js 20+ и бесплатная база на [Neon](https://neon.tech).

```bash
npm install
cp .env.example .env.local   # заполните значения, см. комментарии в файле
npm run db:migrate           # создать таблицы
npm run db:seed              # категории и 16 товаров
npm run dev                  # http://localhost:3000
```

Проверки:

```bash
npm test        # юнит-тесты (vitest)
npm run lint
npx tsc --noEmit
```

## Переменные окружения

| Переменная | Обязательна | Где взять |
|---|---|---|
| `DATABASE_URL` | да | Neon → Connect → pooled connection string |
| `AUTH_SECRET` | да | `npx auth secret` |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | нет | Google Cloud Console → Credentials. Без них кнопки Google нет |
| `STRIPE_SECRET_KEY` | нет | Stripe → Test mode → API keys, только `sk_test_…`. Без него — симуляция оплаты |
| `STRIPE_WEBHOOK_SECRET` | нет | `stripe listen` локально или Stripe → Webhooks → Signing secret |

Секреты хранятся только в `.env.local` (он в `.gitignore`) и в настройках хостинга. В репозитории — лишь `.env.example` с заглушками.

## Публикация на Vercel

1. Импортируйте репозиторий в Vercel.
2. **Settings → Environment Variables**: добавьте переменные из таблицы выше.
3. В Google OAuth добавьте redirect URI `https://<домен>/api/auth/callback/google`.
4. В Stripe (Test mode) создайте webhook `https://<домен>/api/stripe/webhook` с событиями `checkout.session.completed` и `checkout.session.async_payment_succeeded`, его Signing secret запишите в `STRIPE_WEBHOOK_SECRET`.
5. Redeploy, чтобы подхватились переменные.

Миграции Vercel не запускает: при изменении схемы выполните `npm run db:migrate` с production `DATABASE_URL`.

## Telegram Mini App

Каталог и поиск открываются внутри Telegram по адресу `/tg` (страница товара — `/tg/product/<slug>`). Цвета берутся из темы Telegram, работает нативная кнопка «Назад». Кнопка «Купить на сайте» ведёт на обычную страницу товара в том же окне Telegram, там корзина и оформление.

Подключение (нужен HTTPS, поэтому после публикации на Vercel):

1. В [@BotFather](https://t.me/BotFather): `/newbot` — создать бота.
2. `/mybots` → бот → **Bot Settings → Menu Button** → указать `https://<домен>/tg` и подпись, например «Каталог».
3. По желанию: `/newapp` — Mini App с прямой ссылкой `t.me/<бот>/<имя>` на тот же адрес.

Без Telegram `/tg` открывается и в обычном браузере — удобно для проверки вёрстки.

## Оплата: только тест

- Реальные деньги **не списываются**. Код принимает только ключи `sk_test_`; live-ключ игнорируется.
- С ключом Stripe покупатель уходит на страницу Stripe Checkout. Тестовая карта `4242 4242 4242 4242`, любой будущий срок и CVC; отказ — `4000 0000 0000 0002`.
- Без ключа Stripe на странице заказа кнопки «Симулировать успешную оплату / отказ».
- Успешная оплата ставит заказу статус `paid_test`. Отказ при симуляции отменяет заказ и возвращает товар на склад.
- Заказ подтверждается при возврате со Stripe и, если настроен webhook, даже когда покупатель закрыл вкладку.

## Как устроено

- Цены и остатки всегда берутся из базы на сервере; из браузера приходят только `productId` и количество.
- Заказ создаётся в одной транзакции: блокировка товаров, проверка остатка, снимок цен, резерв склада, очистка корзины.
- Заказы и оплата фильтруются по владельцу: чужой номер заказа — 404.
- Гостевая корзина хранится в базе по cookie `guest_id`, избранное и сравнение гостя — в cookie; при входе они переносятся в аккаунт.

## Ограничения

- Доставка бесплатная и без реальной логистики, срок акции на главной — «до конца недели» на клиенте.
- Нет админки: товары меняются через `src/lib/mock-data.ts` и `npm run db:seed`. **Seed перезаписывает цены и остатки** всех товаров.
- Фото товаров — с Wikimedia Commons (CC BY / CC BY-SA / CC0), часто похожие модели; автор и лицензия подписаны на странице товара и перечислены в `src/lib/photo-credits.json`. У Xiaomi TV A фото нет.
- Отказ и истечение сессии Stripe не отменяют заказ: его можно оплатить повторно.

Документы проекта: `PRD.md` (требования), `SPEC.md` (спецификация и приёмочные тесты), `Tasks.md` (задачи по этапам), `DECISIONS.md` (принятые решения).
