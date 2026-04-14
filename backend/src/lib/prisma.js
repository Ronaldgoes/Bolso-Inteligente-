import dotenv from "dotenv";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import pkg from "@prisma/client";

dotenv.config();

const { PrismaClient } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL nao definida. Verifique o arquivo ".env".');
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});
