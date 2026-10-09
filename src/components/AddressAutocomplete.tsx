"use client";

import { useEffect, useRef, useState } from "react";
import {
  searchAddresses,
  isAddressLikelyValid,
  type AddressSuggestion,
} from "@/lib/address";

type Props = {
  value: string;
  onChange: (display: string, suggestion: AddressSuggestion | null) => void;
  onValidChange?: (valid: boolean) => void;
  required?: boolean;
  placeholder?: string;
};

export default function AddressAutocomplete({
  value,
  onChange,
  onValidChange,
  required,
  placeholder = "Start typing your full address…",
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const results = await searchAddresses(value, ac.signal);
        if (!ac.signal.aborted) {
          setSuggestions(results);
          setOpen(true);
        }
      } catch {
        /* aborted or network */
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [value]);

  useEffect(() => {
    onValidChange?.(isAddressLikelyValid(selected));
  }, [selected, onValidChange]);

  const pick = (s: AddressSuggestion) => {
    setSelected(s);
    onChange(s.display_name, s);
    setOpen(false);
    setSuggestions([]);
  };

  const valid = isAddressLikelyValid(selected);

  return (
    <div className="relative col-span-2">
      <textarea
        required={required}
        rows={2}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setSelected(null);
          onChange(e.target.value, null);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className={`w-full rounded-xl border bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)] ${
          selected && valid
            ? "border-green-500/60"
            : "border-[var(--border-subtle)]"
        }`}
      />
      {loading && (
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          Searching addresses worldwide…
        </p>
      )}
      {selected && valid && (
        <p className="mt-1 text-[11px] text-green-400">
          ✓ Address verified (OpenStreetMap)
        </p>
      )}
      {value.trim().length >= 3 && selected === null && !loading && (
        <p className="mt-1 text-[11px] text-[var(--warning)]">
          Pick a suggestion below so we can validate your address
        </p>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl">
          {suggestions.map((s) => (
            <li key={`${s.lat}-${s.lon}-${s.display_name}`}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="w-full px-3 py-2.5 text-left text-xs text-white hover:bg-[var(--accent-pink)]/20"
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
