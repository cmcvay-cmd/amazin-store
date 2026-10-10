"use client";

import { useEffect, useState } from "react";

type Props = {
  onDone: () => void;
};

export default function WelcomeScreen({ onDone }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => onDone(), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0D0D0F]">
      {/* Glow orbs */}
      <div
        className={`pointer-events-none absolute h-72 w-72 rounded-full bg-[var(--accent-pink)]/30 blur-3xl transition-all duration-1000 ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
        style={{ top: "20%", left: "10%" }}
      />
      <div
        className={`pointer-events-none absolute h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl transition-all duration-1000 delay-200 ${
          phase >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
        style={{ bottom: "15%", right: "5%" }}
      />

      <div
        className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
          phase >= 1 ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div
          className={`mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--accent-pink)] to-fuchsia-700 text-5xl font-black text-white shadow-2xl shadow-pink-500/40 transition-transform duration-700 ${
            phase >= 2 ? "scale-100 rotate-0" : "scale-75 -rotate-12"
          }`}
        >
          A
        </div>
        <h1
          className={`bg-gradient-to-r from-white via-pink-200 to-[var(--accent-pink)] bg-clip-text text-4xl font-black tracking-tight text-transparent transition-all duration-700 ${
            phase >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          Amazin
        </h1>
        <p
          className={`mt-3 max-w-xs text-center text-sm text-[var(--text-muted)] transition-all duration-700 ${
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Your dark-pink storefront. Shop worldwide. Pay your way.
        </p>
      </div>

      <div
        className={`absolute bottom-16 flex gap-1.5 transition-opacity duration-500 ${
          phase >= 3 ? "opacity-100" : "opacity-0"
        }`}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-pink)]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
