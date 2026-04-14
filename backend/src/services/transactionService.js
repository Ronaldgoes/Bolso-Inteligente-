import { prisma } from "../lib/prisma.js";
import { getSettings } from "./settingsService.js";
import { createHttpError } from "../utils/httpError.js";
import {
  formatMonthKey,
  inferTransactionType,
  parseMoneyInput,
} from "../utils/money.js";

function normalizeTransactionInput(input) {
  const description = String(input.description ?? "").trim();
  const category = String(input.category ?? "").trim() || "Importado";
  const parsedMoney = parseMoneyInput(input.amount);
  const explicitType = input.type ? String(input.type).trim() : null;

  if (!description) {
    throw createHttpError(400, "description e obrigatoria.");
  }

  if (!parsedMoney || parsedMoney.absolute === 0) {
    throw createHttpError(400, "amount deve ser um numero valido diferente de zero.");
  }

  let type = explicitType;

  if (!type) {
    type = inferTransactionType(description, parsedMoney.signed);
  }

  if (!["income", "expense"].includes(type)) {
    throw createHttpError(400, 'type deve ser "income" ou "expense".');
  }

  return {
    description,
    category,
    type,
    amount: parsedMoney.absolute,
  };
}

export async function listTransactions(userId) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTransaction(userId, input) {
  const data = normalizeTransactionInput(input);
  const settings = await getSettings(userId);

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        ...data,
        userId,
      },
    });

    if (data.type === "income" && settings.savingsPercent > 0) {
      const savingsAmount = Number(
        ((data.amount * settings.savingsPercent) / 100).toFixed(2),
      );

      if (savingsAmount > 0) {
        await tx.savings.create({
          data: {
            amount: savingsAmount,
            userId,
          },
        });
      }
    }

    return transaction;
  });
}

export async function deleteTransaction(userId, id) {
  const deleted = await prisma.transaction.deleteMany({
    where: { id, userId },
  });

  if (deleted.count === 0) {
    throw createHttpError(404, "Transacao nao encontrada.");
  }
}

export async function getTransactionSummary(userId) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return transactions.reduce((summary, transaction) => {
    const monthKey = formatMonthKey(new Date(transaction.createdAt));

    if (!summary[monthKey]) {
      summary[monthKey] = {
        income: 0,
        expense: 0,
        balance: 0,
      };
    }

    if (transaction.type === "income") {
      summary[monthKey].income += transaction.amount;
      summary[monthKey].balance += transaction.amount;
    } else {
      summary[monthKey].expense += transaction.amount;
      summary[monthKey].balance -= transaction.amount;
    }

    return summary;
  }, {});
}
