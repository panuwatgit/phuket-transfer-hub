import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const g = globalThis as unknown as { prisma?: PrismaClient; pool?: Pool };

if (!g.pool) g.pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(g.pool);

export const prisma = g.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
