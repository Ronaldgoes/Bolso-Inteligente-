import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from "../services/goalService.js";

export async function getGoals(req, res) {
  const goals = await listGoals(req.user.id);
  res.json(goals);
}

export async function postGoal(req, res) {
  const goal = await createGoal(req.user.id, req.body);
  res.status(201).json(goal);
}

export async function patchGoal(req, res) {
  const goal = await updateGoal(req.user.id, Number(req.params.id), req.body);
  res.json(goal);
}

export async function removeGoal(req, res) {
  await deleteGoal(req.user.id, Number(req.params.id));
  res.sendStatus(204);
}
