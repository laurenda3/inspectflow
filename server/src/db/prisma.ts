import { PrismaClient } from '@prisma/client';

// ensure a single instance in dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'] // add 'query' if you want to see SQL
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
