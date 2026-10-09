import type { ReactNode } from "react";

// Force this dynamic segment to render at request time (not static prerender)
export const dynamic = "force-dynamic";

export default function ProductLayout({ children }: { children: ReactNode }) {
  return children;
}
