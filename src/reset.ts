import { PrismaClient } from "@prisma/client";

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  // Delete all data from all tables
  for (const table of Object.keys(prisma)) {
    await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}
