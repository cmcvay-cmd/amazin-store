"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

type HeaderProps = {
  showSearch?: boolean;
  title?: string;
  showBack?: boolean;
};

export default function Header({
  showSearch = true,
  title,
  showBack = false,
}: HeaderProps) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <Link
              href="/"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)] text-white text-lg btn-press"
              aria-label="Back"
            >
              ←
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-pink)] text-sm font-bold text-white">
                A
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Amazin
              </span>
            </Link>
          )}
          {title && (
            <h1 className="truncate text-lg font-bold text-white">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && !title && (
            <Link
              href="/#search"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] text-lg btn-press"
              aria-label="Search"
            >
              ⌕
            </Link>
          )}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-pink)] text-base btn-press"
            aria-label="Cart"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[var(--accent-pink)] animate-badge-bounce">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
