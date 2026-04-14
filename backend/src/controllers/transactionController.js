import {
  createTransaction,
  deleteTransaction,
  getTransactionSummary,
  listTransactions,
} from "../services/transactionService.js";

export async function getTransactions(req, res) {
  const data = await listTransactions(req.user.id);
  res.json(data);
}

export async function getTransactionsSummary(req, res) {
  const data = await getTransactionSummary(req.user.id);
  res.json(data);
}

export async function postTransaction(req, res) {
  const transaction = await createTransaction(req.user.id, req.body);
  res.status(201).json(transaction);
}

export async function removeTransaction(req, res) {
  await deleteTransaction(req.user.id, Number(req.params.id));
  res.sendStatus(204);
}
