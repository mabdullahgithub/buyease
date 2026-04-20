import { PrismaClient, Prisma, type Session } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { Prisma } from "@prisma/client";
export type DbSession = Session;
export type {
  Session,
  Merchant,
  Order,
  OrderStatus,
  Plan,
  PlanInterval,
  AdminUser,
  AdminRole,
  AdminPasswordResetToken,
} from "@prisma/client";
