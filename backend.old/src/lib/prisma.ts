import { PrismaClient } from "@prisma/client";

declare global {
  var __salesSystemPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__salesSystemPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__salesSystemPrisma = prisma;
}
