import { useState } from "react";
import { formatCurrency } from "../App.jsx";

const initialForm = {
  description: "",
  amount: "",
  type: "expense",
  category: "",
};

export function TransactionsTab({
  loading,
  transactions,
  transactionSummary,
  onCreateTransaction,
  onDeleteTransaction,
  onRefresh,
}) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    await onCreateTransaction({
      ...form,
      amount: Number(form.amount),
    });
    setSubmitting(false);
    setForm(initialForm);
  }

  return (
    <section className="grid">
      <article className="card">
        <h2>Nova transacao</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Descricao
            <input name="description" value={form.description} onChange={handleChange} required />
          </label>
          <label>
            Valor
            <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required />
          </label>
          <label>
            Tipo
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
          </label>
          <label>
            Categoria
            <input name="category" value={form.category} onChange={handleChange} required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Adicionar transacao"}
          </button>
        </form>
      </article>

      <article className="card">
        <div className="listHeader">
          <h2>Resumo mensal</h2>
          <button type="button" className="secondary" onClick={onRefresh}>
            Atualizar
          </button>
        </div>
        {Object.keys(transactionSummary).length === 0 ? (
          <p className="muted">Sem resumo mensal ainda.</p>
        ) : (
          <div className="chartStack">
            {Object.entries(transactionSummary).map(([month, summary]) => (
              <div key={month} className="goalCard">
                <div className="listHeader">
                  <strong>{month}</strong>
                  <span className={summary.balance >= 0 ? "positive" : "negative"}>
                    {formatCurrency(summary.balance)}
                  </span>
                </div>
                <p className="muted">
                  Receitas: {formatCurrency(summary.income)} | Despesas: {formatCurrency(summary.expense)}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card spanTwo">
        <h2>Transacoes</h2>
        {loading ? <p className="muted">Carregando transacoes...</p> : null}
        {!loading && transactions.length === 0 ? (
          <p className="muted">Nenhuma transacao cadastrada ainda.</p>
        ) : null}
        <ul className="list">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="listItem">
              <div>
                <strong>{transaction.description}</strong>
                <span className="muted">
                  {transaction.category} |{" "}
                  {new Date(transaction.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="itemActions">
                <span className={transaction.type === "income" ? "positive" : "negative"}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
                <button type="button" className="danger" onClick={() => onDeleteTransaction(transaction.id)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
