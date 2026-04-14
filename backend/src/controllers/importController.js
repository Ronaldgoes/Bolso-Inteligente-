import { importStatement } from "../services/importService.js";

export async function processImport(req, res) {
  const result = await importStatement(req.user.id, req.file);
  res.status(201).json(result);
}
