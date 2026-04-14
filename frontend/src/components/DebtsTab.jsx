import { useState } from "react";
import { formatCurrency } from "../App.jsx";

const initialDebt = {
  name: "",
  totalAmount: "",
  installments: "",
  paid: "",
};

export function DebtsTab({ debts, onCreateDebt, onUpdateDebt, onDeleteDebt }) {
  const [form, setForm] = useState(initialDebt);
  const [editing, setEditing] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreateDebt({
      name: form.name,
      totalAmount: Number(form.totalAmount),
      installments: Number(form.installments),
      paid: form.paid ? Number(form.paid) : 0,
    });
    setForm(initialDebt);
  }

  function getDraft(debt) {
    return editing[debt.id] || {
      name: debt.name,
      totalAmount: debt.totalAmount,
      installments: debt.installments,
      paid: debt.paid,
    };
  }

  return (
    <section className="grid">
      <article className="card">
        <h2>Nova divida</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Valor total
            <input
              name="totalAmount"
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Parcelas
            <input
              name="installments"
              type="number"
              value={form.installments}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Pagas
            <input name="paid" type="number" value={form.paid} onChange={handleChange} />
          </label>
          <button type="submit">Criar divida</button>
        </form>
      </article>

      <article className="card">
        <h2>Dividas cadastradas</h2>
        {debts.length === 0 ? (
          <p className="muted">Nenhuma divida cadastrada.</p>
        ) : (
          <div className="goalStack">
            {debts.map((debt) => {
              const draft = getDraft(debt);

              return (
                <div key={debt.id} className="goalCard">
                  <div className="listHeader">
                    <strong>{debt.name}</strong>
                    <span>{debt.installmentsRemaining} restantes</span>
                  </div>
                  <p className="muted">
                    Total: {formatCurrency(debt.totalAmount)} | Mensal: {formatCurrency(debt.monthlyAmount)}
                  </p>
                  <p className="muted">
                    Pagas: {debt.paid}/{debt.installments}
                  </p>
                  <div className="form compactForm">
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [debt.id]: { ...draft, name: event.target.value },
                        }))
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={draft.totalAmount}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [debt.id]: { ...draft, totalAmount: event.target.value },
                        }))
                      }
                    />
                    <input
                      type="number"
                      value={draft.installments}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [debt.id]: { ...draft, installments: event.target.value },
                        }))
                      }
                    />
                    <input
                      type="number"
                      value={draft.paid}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [debt.id]: { ...draft, paid: event.target.value },
                        }))
                      }
                    />
                    <div className="itemActions">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDebt(debt.id, {
                            name: draft.name,
                            totalAmount: Number(draft.totalAmount),
                            installments: Number(draft.installments),
                            paid: Number(draft.paid),
                          })
                        }
                      >
                        Salvar
                      </button>
                      <button type="button" className="danger" onClick={() => onDeleteDebt(debt.id)}>
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}
