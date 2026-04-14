import { useState } from "react";
import { formatCurrency } from "../App.jsx";

const initialGoal = {
  name: "",
  target: "",
  current: "",
};

export function GoalsTab({ goals, onCreateGoal, onUpdateGoal, onDeleteGoal }) {
  const [form, setForm] = useState(initialGoal);
  const [editing, setEditing] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreateGoal({
      name: form.name,
      target: Number(form.target),
      current: form.current ? Number(form.current) : 0,
    });
    setForm(initialGoal);
  }

  function getDraft(goal) {
    return editing[goal.id] || {
      name: goal.name,
      target: goal.target,
      current: goal.current,
    };
  }

  return (
    <section className="grid">
      <article className="card">
        <h2>Nova meta</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome da meta
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Valor alvo
            <input name="target" type="number" step="0.01" value={form.target} onChange={handleChange} required />
          </label>
          <label>
            Valor atual
            <input name="current" type="number" step="0.01" value={form.current} onChange={handleChange} />
          </label>
          <button type="submit">Criar meta</button>
        </form>
      </article>

      <article className="card">
        <h2>Metas cadastradas</h2>
        {goals.length === 0 ? (
          <p className="muted">Nenhuma meta cadastrada ainda.</p>
        ) : (
          <div className="goalStack">
            {goals.map((goal) => {
              const draft = getDraft(goal);

              return (
                <div key={goal.id} className="goalCard">
                  <div className="listHeader">
                    <strong>{goal.name}</strong>
                    <span>{goal.progress.toFixed(1)}%</span>
                  </div>
                  <div className="progressBar">
                    <div
                      className="progressValue"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <p className="muted">
                    {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                  </p>
                  <div className="form compactForm">
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [goal.id]: { ...draft, name: event.target.value },
                        }))
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={draft.target}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [goal.id]: { ...draft, target: event.target.value },
                        }))
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={draft.current}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          [goal.id]: { ...draft, current: event.target.value },
                        }))
                      }
                    />
                    <div className="itemActions">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateGoal(goal.id, {
                            name: draft.name,
                            target: Number(draft.target),
                            current: Number(draft.current),
                          })
                        }
                      >
                        Salvar
                      </button>
                      <button type="button" className="danger" onClick={() => onDeleteGoal(goal.id)}>
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
