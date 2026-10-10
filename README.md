# Amazin — Dark Pink Storefront

Mobile-first Amazon-style e-commerce UI built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS v4**.

## Features

- **Home** — Search, category chips, flash deals hero, responsive product grid
- **Product detail** — Variants, rating, sticky Buy Now / Add to Cart
- **Cart** — Qty controls, order summary
- **Checkout** — Buyer details, gift/self, worldwide address autocomplete, bank transfer
- **Chat** (`/chat`) — Buyers message support (Supabase Realtime)
- **Admin** (`/admin`) — PIN-gated product CRUD + image upload (Supabase Storage)
- **Admin inbox** (`/admin/chat`) — Reply to buyer threads

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables (Vercel + local)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (chat/images) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (chat/images) | Supabase anon key |
| `NEXT_PUBLIC_ADMIN_PIN` | Recommended | Admin panel PIN (default is insecure) |

In **Vercel → Project → Settings → Environment Variables**, add the three above, then **Redeploy**.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste and run `supabase-schema.sql`
3. **Database → Replication** → enable Realtime for `chat_messages` and `chat_threads`
4. Copy Project URL + anon key into Vercel env vars

## Routes

| Path | Description |
|------|-------------|
| `/` | Storefront home |
| `/product/[id]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Bank transfer checkout |
| `/chat` | Buyer ↔ support chat |
| `/admin` | Product management (PIN) |
| `/admin/chat` | Admin chat inbox (PIN) |

## Design tokens

| Token | Value |
|-------|-------|
| Background | `#0D0D0F` |
| Elevated | `#16161A` |
| Card | `#1C1C21` |
| Accent pink | `#FF2D95` |
| Muted text | `#A0A0A8` |

## Notes

- Products & cart default to **localStorage** (per browser) until you move catalog to Supabase
- Admin PIN is client-side only — not production-grade security
- Address autocomplete uses `/api/address` → OpenStreetMap Nominatim
- Figma: https://www.figma.com/design/sYk16HNBzgVcLq0GzkTdwK
