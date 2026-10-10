"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  detectCurrency,
  formatMoney,
  shippingUsd,
  type CurrencyInfo,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: CurrencyInfo;
  ready: boolean;
  format: (usd: number) => string;
  shippingLocal: number;
  shippingUsd: number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: "USD",
    symbol: "$",
    rate: 1,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    detectCurrency().then((c) => {
      setCurrency(c);
      setReady(true);
    });
  }, []);

  const shipUsd = shippingUsd(currency.country);
  const value: CurrencyContextValue = {
    currency,
    ready,
    format: (usd) => formatMoney(usd, currency),
    shippingLocal: shipUsd * currency.rate,
    shippingUsd: shipUsd,
  };

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
