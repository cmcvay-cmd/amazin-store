"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <ProductsProvider>
          <CartProvider>{children}</CartProvider>
        </ProductsProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
