import { verifyAuthToken } from "../utils/auth.js";
import { createHttpError } from "../utils/httpError.js";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(createHttpError(401, "Faca login para continuar."));
  }

  const token = authorization.slice("Bearer ".length);
  const payload = verifyAuthToken(token);

  req.user = {
    id: Number(payload.sub),
    email: payload.email,
  };

  next();
}
