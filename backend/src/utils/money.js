const incomeKeywords = ["PIX RECEBIDO", "SALARIO", "SALÁRIO", "TED RECEBIDA"];
const expenseKeywords = ["COMPRA", "DEBITO", "DÉBITO", "PAGAMENTO", "PIX ENVIADO"];

function normalizeDigits(value) {
  return String(value ?? "")
    .replace(/R\$\s?/gi, "")
    .replace(/\s+/g, "")
    .trim();
}

export function parseMoneyInput(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }

    return {
      signed: value,
      absolute: Math.abs(value),
      hasExplicitSign: value !== 0,
    };
  }

  const raw = normalizeDigits(value);

  if (!raw) {
    return null;
  }

  const isNegative = raw.startsWith("-") || /^\(.*\)$/.test(raw);
  const signless = raw.replace(/[()]/g, "").replace(/^[+-]/, "");

  let normalized = signless;

  if (signless.includes(",") && signless.includes(".")) {
    normalized = signless.replace(/\./g, "").replace(",", ".");
  } else if (signless.includes(",")) {
    normalized = signless.replace(",", ".");
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  const signed = isNegative ? -Math.abs(parsed) : parsed;

  return {
    signed,
    absolute: Math.abs(signed),
    hasExplicitSign: isNegative || raw.startsWith("+"),
  };
}

export function inferTransactionType(description, signedAmount) {
  if (Number.isFinite(signedAmount) && signedAmount < 0) {
    return "expense";
  }

  if (Number.isFinite(signedAmount) && signedAmount > 0) {
    return "income";
  }

  const text = String(description ?? "").toUpperCase();

  if (incomeKeywords.some((keyword) => text.includes(keyword))) {
    return "income";
  }

  if (expenseKeywords.some((keyword) => text.includes(keyword))) {
    return "expense";
  }

  return "expense";
}

export function formatMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
