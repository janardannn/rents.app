import type { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export async function getPrisma(): Promise<PrismaClient> {
  if (!globalForPrisma.prisma) {
    const mod = await import("@/generated/prisma/client");
    const Ctor = mod.PrismaClient as unknown as new () => PrismaClient;
    globalForPrisma.prisma = new Ctor();
  }
  return globalForPrisma.prisma;
}
