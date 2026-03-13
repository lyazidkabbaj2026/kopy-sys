import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// 1. Initialize the adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Pass the adapter into the PrismaClientOptions
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;