export type AddressSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "AmazinStore/1.0 (checkout address autocomplete)",
    },
  });

  if (!res.ok) return [];
  const data = (await res.json()) as AddressSuggestion[];
  return Array.isArray(data) ? data : [];
}

export function isAddressLikelyValid(s: AddressSuggestion | null): boolean {
  if (!s?.display_name) return false;
  const a = s.address;
  if (!a) return s.display_name.split(",").length >= 3;
  const hasLocality = Boolean(a.city || a.town || a.village || a.state);
  const hasCountry = Boolean(a.country);
  return hasCountry && (hasLocality || Boolean(a.road));
}