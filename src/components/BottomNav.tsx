"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const items = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/#categories", label: "Categories", icon: "▦" },
  { href: "/cart", label: "Cart", icon: "🛒" },
  { href: "/admin", label: "Admin", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  // Hide on admin for cleaner UX optional — keep visible
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around px-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("#")[0]);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-transform active:scale-95 ${
                active ? "text-[var(--accent-pink)]" : "text-[var(--text-muted)]"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span
                className={`text-[10px] ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
              {item.href === "/cart" && totalItems > 0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-pink)] px-1 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
