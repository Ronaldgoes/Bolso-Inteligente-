import axios from "axios";

const STORAGE_KEY = "financeiro-auth";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

function getStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function readAuth() {
  return getStoredAuth();
}

export async function register(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function getTransactions() {
  const response = await api.get("/transactions");
  return response.data;
}

export async function getTransactionSummary() {
  const response = await api.get("/transactions/summary");
  return response.data;
}

export async function createTransaction(payload) {
  const response = await api.post("/transactions", payload);
  return response.data;
}

export async function deleteTransaction(id) {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
}

export async function importStatement(file) {
  const formData = new FormData();
  formData.append("statement", file);

  const response = await api.post("/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getGoals() {
  const response = await api.get("/goals");
  return response.data;
}

export async function createGoal(payload) {
  const response = await api.post("/goals", payload);
  return response.data;
}

export async function updateGoal(id, payload) {
  const response = await api.patch(`/goals/${id}`, payload);
  return response.data;
}

export async function deleteGoal(id) {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
}

export async function getSavingsSummary() {
  const response = await api.get("/savings/summary");
  return response.data;
}

export async function getSettings() {
  const response = await api.get("/savings/settings");
  return response.data;
}

export async function updateSettings(payload) {
  const response = await api.patch("/savings/settings", payload);
  return response.data;
}

export async function getDebts() {
  const response = await api.get("/debts");
  return response.data;
}

export async function createDebt(payload) {
  const response = await api.post("/debts", payload);
  return response.data;
}

export async function updateDebt(id, payload) {
  const response = await api.patch(`/debts/${id}`, payload);
  return response.data;
}

export async function deleteDebt(id) {
  const response = await api.delete(`/debts/${id}`);
  return response.data;
}
