import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signAuthToken } from "../utils/auth.js";
import { createHttpError } from "../utils/httpError.js";

function buildAuthResponse(user) {
  const token = signAuthToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function registerUser(input) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "").trim();

  if (!email || !password) {
    throw createHttpError(400, "email e password sao obrigatorios.");
  }

  if (password.length < 6) {
    throw createHttpError(400, "A senha deve ter pelo menos 6 caracteres.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw createHttpError(409, "Ja existe uma conta com este email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      settings: {
        create: {
          savingsPercent: 10,
        },
      },
    },
  });

  return buildAuthResponse(user);
}

export async function loginUser(input) {
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "").trim();

  if (!email || !password) {
    throw createHttpError(400, "email e password sao obrigatorios.");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createHttpError(401, "Email ou senha invalidos.");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw createHttpError(401, "Email ou senha invalidos.");
  }

  return buildAuthResponse(user);
}
