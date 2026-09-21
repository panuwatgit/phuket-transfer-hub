// Prisma 7: datasource URL lives here (schema.prisma has no url)
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // empty string keeps `next build` from throwing when DATABASE_URL is absent
    url: process.env.DATABASE_URL || "",
  },
});
