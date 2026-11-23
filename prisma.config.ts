import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

// Load DATABASE_URL from .env.local / .env exactly like Next.js does
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env (not env()) so `prisma generate` / postinstall works without a database
    url: process.env.DATABASE_URL,
  },
});
