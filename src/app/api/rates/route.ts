import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 3600; // cache hint

/**
 * Live USD → world rates.
 * Primary: Frankfurter (ECB-based, free, no key)
 * Fallback: open.er-api.com
 */
export async function GET() {
  try {
    const frank = await fetch(
      "https://api.frankfurter.app/latest?from=USD",
      { next: { revalidate: 3600 } }
    );
    if (frank.ok) {
      const data = (await frank.json()) as {
        base: string;
        date: string;
        rates: Record<string, number>;
      };
      return NextResponse.json({
        base: "USD",
        date: data.date,
        rates: { USD: 1, ...data.rates },
        source: "frankfurter",
      });
    }
  } catch {
    /* try fallback */
  }

  try {
    const er = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (er.ok) {
      const data = (await er.json()) as {
        result: string;
        time_last_update_utc?: string;
        rates: Record<string, number>;
      };
      if (data.result === "success" && data.rates) {
        return NextResponse.json({
          base: "USD",
          date: data.time_last_update_utc || new Date().toISOString(),
          rates: data.rates,
          source: "open.er-api",
        });
      }
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json(
    { error: "Could not fetch live rates", rates: { USD: 1 } },
    { status: 502 }
  );
}
