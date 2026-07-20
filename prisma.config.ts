// Prisma 7 config file — the CLI (generate/migrate/studio) reads DATABASE_URL
// from here, not from schema.prisma. The Next.js app itself still reads
// DATABASE_URL directly via process.env when Prisma Client is instantiated
// (see src/lib/db.ts), since Next.js loads .env.local/.env on its own.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
