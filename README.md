# Amazin — Dark Pink Storefront

Mobile-first Amazon-style e-commerce UI built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS v4**.

## Features

- **Home** — Search, category chips, flash deals hero, responsive product grid
- **Product detail** — Variants, rating, sticky Buy Now / Add to Cart
- **Cart** — Qty controls, order summary, free shipping
- **Checkout** — Bank transfer payment, transfer details, proof upload, confirmation
- **Admin** (`/admin`) — Add / edit / delete products (persisted in `localStorage`)
- Cart & products persist in browser localStorage
- Dark + pink design system, hover animations, page transitions

## Quick start

```bash
cd amazin-store
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Description |
|------|-------------|
| `/` | Storefront home |
| `/product/[id]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Bank transfer checkout |
| `/admin` | Product management panel |

## Design tokens

| Token | Value |
|-------|-------|
| Background | `#0D0D0F` |
| Elevated | `#16161A` |
| Card | `#1C1C21` |
| Accent pink | `#FF2D95` |
| Muted text | `#A0A0A8` |

## Notes

- No auth / login — pure front store + admin for demos
- Products & cart state are client-side only (localStorage)
- Replace emoji placeholders with real images when ready
- For production, connect a real DB and payment provider

Figma design: https://www.figma.com/design/sYk16HNBzgVcLq0GzkTdwK
