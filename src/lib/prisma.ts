import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

let dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

if (dbUrl.startsWith("file:")) {
  const filePath = dbUrl.substring(5);
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  dbUrl = `file:${absolutePath}`;
}

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaLibSql({ url: dbUrl });
  prismaInstance = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaLibSql({ url: dbUrl });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prismaInstance = globalForPrisma.prisma;
}

export const prisma = prismaInstance;
export { dbUrl };
