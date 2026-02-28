# MagicBot Clone — Full Project Plan

## Overview

A multi-tenant SaaS platform where businesses (sellers) can register, connect their Telegram bot, and manage an online store through a dashboard. Customers interact with the store via the Telegram bot and a Mini App (Web App).

Reference projects: robosell.uz, magicbot.uz

---

## Tech Stack

| Layer                | Technology                                                    |
| -------------------- | ------------------------------------------------------------- |
| Backend              | Laravel (latest)                                              |
| Frontend (Dashboard) | React — Laravel ReactJS Starter Kit (Breeze)                  |
| Telegram Bot         | Nutgram (Laravel package)                                     |
| Roles & Permissions  | Spatie Laravel Permission                                     |
| Multi-tenancy        | Single DB + `seller_id` scoping (Spatie Laravel Multitenancy) |
| Storage              | Local disk (S3-ready) for product images                      |
| Queue                | Laravel Queue + database driver                               |

---

## Roles

Two roles managed via Spatie Laravel Permission:

- `super-admin` — platform owner, manages all sellers
- `seller` — business owner, manages their own store and bots

> Customers are NOT Laravel users. They are stored in a separate `customers` table, identified via Telegram `user_id`, and have no login to the web application.

---

## Environment Variables

The following must be defined in `.env`:

```
APP_URL=https://ourdomain.com        # Used for webhook registration
TELEGRAM_WEBHOOK_SECRET=xxx          # Optional secret token for webhook verification
DB_*                                 # Standard Laravel DB config
QUEUE_CONNECTION=database            # Queue driver
```

---

## Registration & Onboarding Flow

### Seller Registration

1. Seller opens the platform website
2. Enters **phone number** + **Telegram bot token**
3. System validates the bot token by calling `https://api.telegram.org/bot{token}/getMe`
4. **If token is invalid:** show error on registration page — "Invalid bot token. Please check and try again." Do NOT create the account.
5. **If token is valid:** system creates the seller account with an **auto-generated strong password**
6. Bot record is created, webhook is registered: `POST https://api.telegram.org/bot{token}/setWebhook` → `https://ourdomain.com/webhook/{bot_id}`
7. Seller is shown: **"Your login: +998901234567 | Password: Xk9#mP2q — copy it now!"**
8. Seller is automatically logged in and redirected to their **dashboard**

### Password Recovery

No self-service recovery. Seller contacts support. Support resets password via super-admin panel.

### Multiple Bots

A seller can add additional bots from their dashboard (Settings → Bots → Add Bot). Each additional bot goes through the same token validation + webhook registration flow. Each bot is independently active.

---

## Webhook Architecture

### Dynamic Multi-Bot Routing

```
POST https://ourdomain.com/webhook/{bot_id}
```

Laravel resolves the `Bot` model from `{bot_id}`, instantiates Nutgram with that bot's token, and dispatches a queued job to handle the update. This keeps the response time under Telegram's 5-second limit.

```php
Route::post('/webhook/{bot}', [WebhookController::class, 'handle']);
```

- `/webhook/*` must be excluded from Laravel's CSRF middleware in `bootstrap/app.php`
- Nutgram is NOT a singleton — it is instantiated per job with the resolved bot token
- Tenant context (`seller_id`) is set from the resolved `Bot` model before the job runs
- Optionally verify the `X-Telegram-Bot-Api-Secret-Token` header for security

### Queue

All incoming Telegram webhook updates are dispatched as queued jobs. The queue worker must be running:

```
php artisan queue:work
```

Jobs that get queued:

- Processing incoming bot messages and callbacks
- Sending order confirmation messages to customers
- Sending new order notifications to sellers

---

## Seller Dashboard

### Orders

- List of all orders with status, customer name, total price, date
- Filter by status, date range
- Click order → view order items
- Change order status: `pending → accepted → delivering → delivered` or `cancelled`
- New order triggers Telegram notification to seller

### Products

- List: product name, price, image thumbnail, category, quantity
- Filter by: category, name, date added
- Search by name
- Add / Edit / Delete product
- When adding/editing: select category, set quantity
- CSV import and export

### Categories

- List: image, name, number of products
- Add / Edit / Delete category

### Users (Customers)

- Top stats: total customers, new customers today
- Table: customer name, phone, order count, total spend, last order date, last order amount

### Settings → Bots

- List of connected bots: username, active status, webhook status
- Add new bot (token input → validate → register webhook)
- **Deactivate** a bot: sets `is_active = false`, removes webhook from Telegram (`deleteWebhook`). Bot stops responding but record is kept.
- **Delete** a bot: permanently removes the bot record and deletes webhook from Telegram. Requires confirmation prompt.

### Analytics (Basic) — included in MVP

- Today's revenue
- Monthly revenue chart
- Total orders by status

---

## Super-Admin Dashboard

- List of all sellers: name, phone, number of bots, total products sold, registration date
- View individual seller detail
- Reset seller password
- Block / Unblock seller (blocked sellers cannot log in and their bots stop responding)
- Platform-wide stats: total sellers, total orders, total revenue

---

## Telegram Bot Flow (Nutgram — per bot)

```
/start
  → Welcome message
  → "🛍 View Store" button (opens Mini App Web App)
  → "📦 My Orders" button

"📦 My Orders"
  → List of customer's past orders with status

Mini App (Web App button)
  → Opens: https://ourdomain.com/store/{bot_username}
```

---

## Mini App (Customer-facing Web Store)

Route: `https://ourdomain.com/store/{bot_username}`

- Rendered by the same Laravel/React application, scoped by `bot_username` → resolves seller tenant
- Customer identity is verified via Telegram WebApp `initData` passed in every API request header. The backend validates `initData` using HMAC-SHA256 with the bot token before processing any request.
- Pages: Category list → Product list → Product detail → Cart → Checkout
- Checkout submits order to Laravel API
- On successful order: confirmation message sent to customer via bot, new order notification sent to seller via bot

---

## Multi-Tenancy Implementation

**Strategy: Single Database + Global Scopes**

- All tenant-owned models (`Bot`, `Product`, `Category`, `Order`, `Customer`, etc.) include `seller_id`
- Spatie Laravel Multitenancy resolves the current tenant from:
    - **Web requests:** authenticated user's own seller record
    - **Webhook requests:** `Bot` model resolved from route → `bot->seller_id`
    - **Mini App API requests:** `bot_username` from route → resolved bot → `seller_id`
- Global scope is applied automatically — no manual `->where('seller_id', ...)` needed anywhere
- Sellers are fully isolated at the query level

---

## Key Laravel Packages

- `spatie/laravel-permission` — roles and permissions
- `spatie/laravel-multitenancy` — tenant scoping
- `nutgram/nutgram` — Telegram bot framework
- Laravel Breeze (React) — auth scaffolding + starter kit

---

## MVP Scope (Phase 1)

- [ ] Seller registration with bot token validation + auto-password
- [ ] Dynamic webhook routing per bot (with CSRF exclusion + queue)
- [ ] Seller dashboard: Orders, Products, Categories, Users, Analytics
- [ ] Settings → Bots: add, deactivate, delete
- [ ] Super-admin: seller list, password reset, block/unblock
- [ ] Telegram bot: /start, view store button, my orders
- [ ] Mini App: category → product → cart → checkout (with initData auth)
- [ ] CSV import/export for products
- [ ] Order status notifications to seller via Telegram
- [ ] Order confirmation to customer via Telegram

## Post-MVP (Phase 2)

- [ ] Multi-language bot support
- [ ] Delivery zones and shipping cost settings
- [ ] Subscription/billing per seller
- [ ] Bulk product management
