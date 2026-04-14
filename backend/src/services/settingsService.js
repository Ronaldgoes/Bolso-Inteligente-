import { prisma } from "../lib/prisma.js";
import { createHttpError } from "../utils/httpError.js";

const DEFAULT_SAVINGS_PERCENT = 10;

export async function getSettings(userId) {
  let settings = await prisma.settings.findFirst({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        savingsPercent: DEFAULT_SAVINGS_PERCENT,
        userId,
      },
    });
  }

  return settings;
}

export async function updateSettings(userId, input) {
  const savingsPercent = Number(input.savingsPercent);

  if (!Number.isFinite(savingsPercent) || savingsPercent < 0 || savingsPercent > 100) {
    throw createHttpError(400, "savingsPercent deve ser um numero entre 0 e 100.");
  }

  const current = await getSettings(userId);

  return prisma.settings.update({
    where: { id: current.id },
    data: {
      savingsPercent,
    },
  });
}
