import dotenv from "dotenv";
import { createApp } from "./src/app.js";
import { prisma } from "./src/lib/prisma.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL nao definida. Verifique o arquivo ".env" em backend/.');
  process.exit(1);
}

const app = createApp();

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Backend rodando em http://localhost:${PORT}`);
  } catch (error) {
    console.error("Falha ao conectar no banco de dados:", error);
    process.exit(1);
  }
});

async function shutdown(signal) {
  console.log(`Recebido ${signal}. Encerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
