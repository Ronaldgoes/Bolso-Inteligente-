import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getTransactions,
  getTransactionsSummary,
  postTransaction,
  removeTransaction,
} from "../controllers/transactionController.js";

const router = Router();

router.get("/summary", asyncHandler(getTransactionsSummary));
router.get("/", asyncHandler(getTransactions));
router.post("/", asyncHandler(postTransaction));
router.delete("/:id", asyncHandler(removeTransaction));

export default router;
