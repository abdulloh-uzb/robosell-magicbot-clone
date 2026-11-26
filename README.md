# HeyBazaar

HeyBazaar lets a small shop sell through Telegram and Instagram. The seller sets up a store from one dashboard. Customers shop in a Telegram Mini App, and all Telegram and Instagram messages arrive in one inbox. An AI agent can answer customers by itself.

## Features

- **Telegram Mini App store**: catalog, categories, product variants and images, cart, checkout, order history
- **Shared inbox**: Telegram group or channel messages and Instagram DMs show up in the dashboard in real time (Laravel Reverb), and the seller replies from there
- **AI auto-reply**: an agent built with Laravel AI searches products, lists categories, takes order details, and hands the chat to the seller when it can't help
- **Payments**: Payme and Click
- **Seller panel**: products, categories, banners, featured products, reviews, orders, customers and channel posts
- **Admin panel**: manage sellers
- **Languages**: Uzbek, Russian and English
- **Roles and permissions** with spatie/laravel-permission
- **Deploy**: GitHub Actions runs the Pest tests, then deploys over SSH

## Stack

Laravel 12 · Inertia v2 + React 19 + TypeScript · Tailwind CSS 4 · Laravel Reverb + Echo · Laravel AI · Fortify · goodoneuz/pay-uz · Pest

## Run locally

```bash
git clone https://github.com/abdulloh-uzb/robosell-magicbot-clone.git heybazaar
cd heybazaar
composer install && npm install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed
composer run dev   # starts the server, queue worker, Reverb and Vite
```

Put `OPENAI_API_KEY` in `.env` to turn on AI replies. Connect a Telegram bot and an Instagram account in the seller settings.
