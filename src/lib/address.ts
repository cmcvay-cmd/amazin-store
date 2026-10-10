/** Address search via our API proxy (Nominatim on the server). */

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

  const res = await fetch(`/api/address?q=${encodeURIComponent(q)}`, {
    signal,
  });

  if (!res.ok) return [];
  const data = (await res.json()) as AddressSuggestion[];
  return Array.isArray(data) ? data : [];
}

/** Basic validation: must look like a real place (has country + locality or road). */
export function isAddressLikelyValid(s: AddressSuggestion | null): boolean {
  if (!s?.display_name) return false;
  const a = s.address;
  if (!a) return s.display_name.split(",").length >= 3;
  const hasLocality = Boolean(a.city || a.town || a.village || a.state);
  const hasCountry = Boolean(a.country);
  return hasCountry && (hasLocality || Boolean(a.road));
}