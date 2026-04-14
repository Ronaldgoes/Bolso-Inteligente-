import { prisma } from "../lib/prisma.js";
import { createHttpError } from "../utils/httpError.js";

function decorateDebt(debt) {
  const installmentsRemaining = Math.max(debt.installments - debt.paid, 0);
  const monthlyAmount =
    debt.installments > 0 ? Number((debt.totalAmount / debt.installments).toFixed(2)) : 0;

  return {
    ...debt,
    installmentsRemaining,
    monthlyAmount,
  };
}

export async function listDebts(userId) {
  const debts = await prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return debts.map(decorateDebt);
}

export async function createDebt(userId, input) {
  const name = String(input.name ?? "").trim();
  const totalAmount = Number(input.totalAmount);
  const installments = Number(input.installments);
  const paid = input.paid == null ? 0 : Number(input.paid);

  if (!name) {
    throw createHttpError(400, "name e obrigatorio.");
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw createHttpError(400, "totalAmount deve ser maior que zero.");
  }

  if (!Number.isInteger(installments) || installments <= 0) {
    throw createHttpError(400, "installments deve ser um inteiro maior que zero.");
  }

  if (!Number.isInteger(paid) || paid < 0 || paid > installments) {
    throw createHttpError(400, "paid deve ser um inteiro valido.");
  }

  const debt = await prisma.debt.create({
    data: {
      name,
      totalAmount,
      installments,
      paid,
      userId,
    },
  });

  return decorateDebt(debt);
}

export async function updateDebt(userId, id, input) {
  const existing = await prisma.debt.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw createHttpError(404, "Divida nao encontrada.");
  }

  const name = input.name == null ? existing.name : String(input.name).trim();
  const totalAmount =
    input.totalAmount == null ? existing.totalAmount : Number(input.totalAmount);
  const installments =
    input.installments == null ? existing.installments : Number(input.installments);
  const paid = input.paid == null ? existing.paid : Number(input.paid);

  if (!name) {
    throw createHttpError(400, "name e obrigatorio.");
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw createHttpError(400, "totalAmount deve ser maior que zero.");
  }

  if (!Number.isInteger(installments) || installments <= 0) {
    throw createHttpError(400, "installments deve ser um inteiro maior que zero.");
  }

  if (!Number.isInteger(paid) || paid < 0 || paid > installments) {
    throw createHttpError(400, "paid deve ser um inteiro valido.");
  }

  const debt = await prisma.debt.update({
    where: { id },
    data: {
      name,
      totalAmount,
      installments,
      paid,
    },
  });

  return decorateDebt(debt);
}

export async function deleteDebt(userId, id) {
  const deleted = await prisma.debt.deleteMany({
    where: { id, userId },
  });

  if (deleted.count === 0) {
    throw createHttpError(404, "Divida nao encontrada.");
  }
}
