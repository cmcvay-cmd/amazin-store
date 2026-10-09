import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable experimental prerender strictness so client routes
  // (params, usePathname, localStorage contexts) build cleanly on Vercel
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
