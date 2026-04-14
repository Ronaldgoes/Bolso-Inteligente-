import {
  createDebt,
  deleteDebt,
  listDebts,
  updateDebt,
} from "../services/debtService.js";

export async function getDebts(req, res) {
  const debts = await listDebts(req.user.id);
  res.json(debts);
}

export async function postDebt(req, res) {
  const debt = await createDebt(req.user.id, req.body);
  res.status(201).json(debt);
}

export async function patchDebt(req, res) {
  const debt = await updateDebt(req.user.id, Number(req.params.id), req.body);
  res.json(debt);
}

export async function removeDebt(req, res) {
  await deleteDebt(req.user.id, Number(req.params.id));
  res.sendStatus(204);
}
