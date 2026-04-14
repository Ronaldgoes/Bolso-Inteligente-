import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDebts,
  patchDebt,
  postDebt,
  removeDebt,
} from "../controllers/debtController.js";

const router = Router();

router.get("/", asyncHandler(getDebts));
router.post("/", asyncHandler(postDebt));
router.patch("/:id", asyncHandler(patchDebt));
router.delete("/:id", asyncHandler(removeDebt));

export default router;
