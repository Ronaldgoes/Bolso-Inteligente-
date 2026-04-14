import { prisma } from "../lib/prisma.js";
import { createHttpError } from "../utils/httpError.js";

function decorateGoal(goal) {
  return {
    ...goal,
    progress: goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0,
  };
}

export async function listGoals(userId) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return goals.map(decorateGoal);
}

export async function createGoal(userId, input) {
  const name = String(input.name ?? "").trim();
  const target = Number(input.target);
  const current = input.current == null ? 0 : Number(input.current);

  if (!name) {
    throw createHttpError(400, "name e obrigatorio.");
  }

  if (!Number.isFinite(target) || target <= 0) {
    throw createHttpError(400, "target deve ser um numero maior que zero.");
  }

  if (!Number.isFinite(current) || current < 0) {
    throw createHttpError(400, "current deve ser um numero valido.");
  }

  const goal = await prisma.goal.create({
    data: {
      name,
      target,
      current,
      userId,
    },
  });

  return decorateGoal(goal);
}

export async function updateGoal(userId, id, input) {
  const existing = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw createHttpError(404, "Meta nao encontrada.");
  }

  const name = input.name == null ? existing.name : String(input.name).trim();
  const target = input.target == null ? existing.target : Number(input.target);
  const current = input.current == null ? existing.current : Number(input.current);

  if (!name) {
    throw createHttpError(400, "name e obrigatorio.");
  }

  if (!Number.isFinite(target) || target <= 0) {
    throw createHttpError(400, "target deve ser um numero maior que zero.");
  }

  if (!Number.isFinite(current) || current < 0) {
    throw createHttpError(400, "current deve ser um numero valido.");
  }

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      name,
      target,
      current,
    },
  });

  return decorateGoal(goal);
}

export async function deleteGoal(userId, id) {
  const deleted = await prisma.goal.deleteMany({
    where: { id, userId },
  });

  if (deleted.count === 0) {
    throw createHttpError(404, "Meta nao encontrada.");
  }
}
