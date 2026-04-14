import pdfParse from "pdf-parse";
import { parse } from "csv-parse/sync";
import { createTransaction } from "./transactionService.js";
import { createHttpError } from "../utils/httpError.js";
import { inferTransactionType, parseMoneyInput } from "../utils/money.js";

function inferCategory(description) {
  const text = String(description ?? "").toLowerCase();

  if (text.includes("salario") || text.includes("pix receb")) {
    return "Receitas";
  }

  if (text.includes("mercado") || text.includes("supermercado")) {
    return "Alimentacao";
  }

  if (text.includes("uber") || text.includes("combustivel")) {
    return "Transporte";
  }

  if (text.includes("aluguel") || text.includes("energia")) {
    return "Moradia";
  }

  return "Importado";
}

function buildImportedTransaction(description, moneyData, category) {
  if (!description || !moneyData || moneyData.absolute === 0) {
    return null;
  }

  return {
    description: String(description).trim(),
    amount: moneyData.absolute,
    type: inferTransactionType(description, moneyData.signed),
    category: category || inferCategory(description),
  };
}

function resolveCsvDescription(record) {
  return (
    record.description ||
    record.descricao ||
    record.historico ||
    record.lancamento ||
    record.memo ||
    record.descricao_lancamento
  );
}

function resolveCsvMoney(record, description) {
  const directAmount =
    parseMoneyInput(record.amount) ??
    parseMoneyInput(record.valor) ??
    parseMoneyInput(record.value);

  const creditAmount =
    parseMoneyInput(record.credito) ??
    parseMoneyInput(record.entrada) ??
    parseMoneyInput(record.credit);

  const debitAmount =
    parseMoneyInput(record.debito) ??
    parseMoneyInput(record.saida) ??
    parseMoneyInput(record.debit);

  if (debitAmount) {
    return {
      ...debitAmount,
      signed: -Math.abs(debitAmount.absolute),
    };
  }

  if (creditAmount) {
    return {
      ...creditAmount,
      signed: Math.abs(creditAmount.absolute),
    };
  }

  if (!directAmount) {
    return null;
  }

  if (directAmount.hasExplicitSign) {
    return directAmount;
  }

  const inferredType = inferTransactionType(description, 0);

  return {
    ...directAmount,
    signed:
      inferredType === "expense"
        ? -Math.abs(directAmount.absolute)
        : Math.abs(directAmount.absolute),
  };
}

function extractTransactionsFromCsv(buffer) {
  const text = buffer.toString("utf-8");
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows = parse(text, {
    bom: true,
    columns: false,
    delimiter,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  });
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((column) => String(column).toLowerCase());

  const transactions = [];

  for (const row of dataRows) {
    const normalizedRow =
      row.length > headers.length
        ? [row[0], row.slice(1, row.length - 1).join(","), row[row.length - 1]]
        : row;

    const record = headers.reduce((accumulator, header, index) => {
      accumulator[header] = normalizedRow[index];
      return accumulator;
    }, {});

    const description = resolveCsvDescription(record);
    const moneyData = resolveCsvMoney(record, description);
    const entry = buildImportedTransaction(
      description,
      moneyData,
      record.category || record.categoria,
    );

    if (entry) {
      transactions.push(entry);
    }
  }

  return transactions;
}

function extractTransactionsFromPdfText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const transactions = [];

  for (const line of lines) {
    const match = line.match(
      /^(?:\d{2}\/\d{2}(?:\/\d{2,4})?\s+)?(.+?)\s+((?:R\$\s*)?[\-()]?\d[\d.,)]*)$/,
    );

    if (!match) {
      continue;
    }

    const [, description, rawAmount] = match;
    const moneyData = parseMoneyInput(rawAmount);
    const entry = buildImportedTransaction(description, moneyData, null);

    if (entry) {
      transactions.push(entry);
    }
  }

  return transactions;
}

export async function importStatement(userId, file) {
  if (!file) {
    throw createHttpError(400, "Envie um arquivo PDF ou CSV.");
  }

  const extension = file.originalname.split(".").pop()?.toLowerCase();
  let importedTransactions = [];

  if (extension === "csv") {
    importedTransactions = extractTransactionsFromCsv(file.buffer);
  } else if (extension === "pdf") {
    const parsed = await pdfParse(file.buffer);
    importedTransactions = extractTransactionsFromPdfText(parsed.text);
  } else {
    throw createHttpError(400, "Formato nao suportado. Use PDF ou CSV.");
  }

  if (importedTransactions.length === 0) {
    throw createHttpError(
      400,
      "Nao foi possivel identificar transacoes no arquivo enviado.",
    );
  }

  const created = [];

  for (const item of importedTransactions) {
    created.push(await createTransaction(userId, item));
  }

  return {
    inserted: created.length,
    transactions: created,
  };
}
