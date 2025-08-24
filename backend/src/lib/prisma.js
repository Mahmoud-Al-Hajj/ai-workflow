import { PrismaClient } from "@prisma/client";

// Create a single Prisma client instance
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
