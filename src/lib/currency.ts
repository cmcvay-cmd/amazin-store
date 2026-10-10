/** Live FX + geo. Catalog prices are stored in USD and converted for display. */

export type CurrencyInfo = {
  code: string;
  symbol: string;
  rate: number; // 1 USD = rate units of this currency
  country?: string;
  source?: string;
  asOf?: string;
};

const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  INR: "₹",
  AED: "AED ",
  SAR: "SAR ",
  BRL: "R$",
  MXN: "MX$",
  CNY: "¥",
  TRY: "₺",
  EGP: "E£",
  PKR: "Rs",
  PHP: "₱",
  CHF: "CHF ",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  SGD: "S$",
  HKD: "HK$",
  NZD: "NZ$",
};

/** Offline fallback if APIs fail (approximate). */
const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1600,
  GHS: 15.5,
  KES: 129,
  ZAR: 18.2,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149,
  INR: 83,
  AED: 3.67,
  SAR: 3.75,
  BRL: 5.1,
  MXN: 17.2,
  CNY: 7.2,
  TRY: 32,
  EGP: 48,
  PKR: 278,
  PHP: 56,
};

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  IN: "INR",
  AE: "AED",
  SA: "SAR",
  BR: "BRL",
  MX: "MXN",
  CN: "CNY",
  TR: "TRY",
  EG: "EGP",
  PK: "PKR",
  PH: "PHP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  IE: "EUR",
  AT: "EUR",
  BE: "EUR",
  PT: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  SG: "SGD",
  HK: "HKD",
  NZ: "NZD",
};

export function currencyCodeForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] || "USD";
}

export function symbolFor(code: string): string {
  return SYMBOLS[code] || code + " ";
}

export function formatMoney(usd: number, c: CurrencyInfo): string {
  const local = usd * c.rate;
  const zeroDecimal = ["JPY", "KRW", "VND", "NGN", "KES", "UGX", "GNF"].includes(
    c.code
  );
  if (zeroDecimal) {
    return c.symbol + Math.round(local).toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }
  return (
    c.symbol +
    local.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Flat shipping in USD by region (demo). */
export function shippingUsd(countryCode?: string): number {
  if (!countryCode) return 12;
  const cc = countryCode.toUpperCase();
  if (["US", "CA"].includes(cc)) return 8;
  if (["GB", "DE", "FR", "IT", "ES", "NL", "IE", "AT", "BE", "PT"].includes(cc))
    return 10;
  if (["NG", "GH", "KE", "ZA", "EG"].includes(cc)) return 15;
  return 12;
}

type RatesPayload = {
  rates: Record<string, number>;
  date?: string;
  source?: string;
};

let ratesCache: { at: number; data: RatesPayload } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hour client cache

export async function fetchLiveRates(): Promise<RatesPayload> {
  if (ratesCache && Date.now() - ratesCache.at < CACHE_MS) {
    return ratesCache.data;
  }
  try {
    const res = await fetch("/api/rates");
    if (res.ok) {
      const data = (await res.json()) as RatesPayload & { error?: string };
      if (data.rates && typeof data.rates.USD === "number") {
        ratesCache = { at: Date.now(), data };
        return data;
      }
    }
  } catch {
    /* use fallback */
  }
  return { rates: FALLBACK_RATES, source: "fallback", date: undefined };
}

export async function detectCurrency(): Promise<CurrencyInfo> {
  let country = "US";
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string };
      if (data.country_code) country = data.country_code;
    }
  } catch {
    /* keep US */
  }

  const code = currencyCodeForCountry(country);
  const live = await fetchLiveRates();
  const rate =
    typeof live.rates[code] === "number" ? live.rates[code] : FALLBACK_RATES[code] || 1;

  return {
    code,
    symbol: symbolFor(code),
    rate,
    country,
    source: live.source,
    asOf: live.date,
  };
}
