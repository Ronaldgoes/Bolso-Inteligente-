import { prisma } from "../lib/prisma.js";
import { getSettings } from "./settingsService.js";

export async function getSavingsSummary(userId) {
  const settings = await getSettings(userId);
  const savings = await prisma.savings.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSaved = savings.reduce((total, item) => total + item.amount, 0);
  const monthlySaved = savings.reduce((total, item) => {
    const createdAt = new Date(item.createdAt);
    const sameMonth =
      createdAt.getMonth() === currentMonth &&
      createdAt.getFullYear() === currentYear;

    return sameMonth ? total + item.amount : total;
  }, 0);

  return {
    savingsPercent: settings.savingsPercent,
    totalSaved,
    monthlySaved,
    entries: savings,
  };
}
