
import type { NextConfig } from "next";

/**
 * Default build (`npm run build` → `npm start`, or Vercel/Node hosting) runs as a
 * server so the real contact API (`app/api/contact/route.api.ts`) works.
 *
 * `npm run build:static` keeps the old static export to `/out`. A static export
 * cannot run API routes, so point the form at a deployed API with
 * NEXT_PUBLIC_CONTACT_ENDPOINT (and allow that origin via CONTACT_ALLOWED_ORIGINS).
 */
const isStaticExport =
  process.env.STATIC_EXPORT === "1" || process.env.npm_lifecycle_event === "build:static";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),

  // Server-only route files are named `*.api.ts` (e.g. app/api/contact/route.api.ts).
  // They are only registered for server builds, so static export simply leaves them out.
  pageExtensions: isStaticExport ? ["tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js", "api.ts"],

  images: {
    unoptimized: true,
  },

  trailingSlash: true,

  // Dev tunnels only (ngrok etc.). Production ignores this.
  // Example: allowedDevOrigins: ["*.ngrok-free.dev"],
  allowedDevOrigins: [],
};

export default nextConfig;
