import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getGoals,
  patchGoal,
  postGoal,
  removeGoal,
} from "../controllers/goalController.js";

const router = Router();

router.get("/", asyncHandler(getGoals));
router.post("/", asyncHandler(postGoal));
router.patch("/:id", asyncHandler(patchGoal));
router.delete("/:id", asyncHandler(removeGoal));

export default router;
