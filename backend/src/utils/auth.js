import jwt from "jsonwebtoken";
import { createHttpError } from "./httpError.js";

export function signAuthToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nao definida.");
  }

  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyAuthToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nao definida.");
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, "Token invalido ou expirado.");
  }
}
