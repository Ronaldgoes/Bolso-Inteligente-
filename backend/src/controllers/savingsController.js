import { getSavingsSummary } from "../services/savingsService.js";
import { getSettings, updateSettings } from "../services/settingsService.js";

export async function getSavings(req, res) {
  const summary = await getSavingsSummary(req.user.id);
  res.json(summary);
}

export async function getSettingsController(req, res) {
  const settings = await getSettings(req.user.id);
  res.json(settings);
}

export async function patchSettings(req, res) {
  const settings = await updateSettings(req.user.id, req.body);
  res.json(settings);
}
