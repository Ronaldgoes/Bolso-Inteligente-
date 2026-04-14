import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getSavings,
  getSettingsController,
  patchSettings,
} from "../controllers/savingsController.js";

const router = Router();

router.get("/summary", asyncHandler(getSavings));
router.get("/settings", asyncHandler(getSettingsController));
router.patch("/settings", asyncHandler(patchSettings));

export default router;
