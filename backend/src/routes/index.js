import authRouter from "./auth.js";
import transactionsRouter from "./transactions.js";
import importRouter from "./import.js";
import goalsRouter from "./goals.js";
import savingsRouter from "./savings.js";
import debtsRouter from "./debts.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export function registerRoutes(app) {
  app.use("/auth", authRouter);
  app.use(requireAuth);
  app.use("/transactions", transactionsRouter);
  app.use("/import", importRouter);
  app.use("/goals", goalsRouter);
  app.use("/savings", savingsRouter);
  app.use("/debts", debtsRouter);
}
