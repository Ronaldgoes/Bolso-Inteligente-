import { useEffect, useState } from "react";
import { formatCurrency } from "../App.jsx";

export function SavingsTab({ savings, settings, onUpdateSavingsPercent }) {
  const [percent, setPercent] = useState(settings.savingsPercent ?? 10);

  useEffect(() => {
    setPercent(settings.savingsPercent ?? 10);
  }, [settings.savingsPercent]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onUpdateSavingsPercent(Number(percent));
  }

  return (
    <section className="grid">
      <article className="card">
        <h2>Configuracao do guardado</h2>
        <p className="muted">
          Toda receita nova separa automaticamente esta porcentagem para a poupanca.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Percentual de economia
            <input type="number" step="0.01" min="0" max="100" value={percent} onChange={(event) => setPercent(event.target.value)} required />
          </label>
          <button type="submit">Salvar percentual</button>
        </form>
      </article>

      <article className="card">
        <h2>Resumo do guardado</h2>
        <div className="metricGrid">
          <div className="metricCard">
            <span>Total guardado</span>
            <strong className="positive">{formatCurrency(savings.totalSaved)}</strong>
          </div>
          <div className="metricCard">
            <span>Guardado no mes</span>
            <strong className="positive">{formatCurrency(savings.monthlySaved)}</strong>
          </div>
          <div className="metricCard">
            <span>Percentual atual</span>
            <strong>{Number(savings.savingsPercent || 0).toFixed(2)}%</strong>
          </div>
        </div>
        <h3>Ultimos valores guardados</h3>
        {savings.entries.length === 0 ? (
          <p className="muted">Nenhum valor guardado ainda.</p>
        ) : (
          <ul className="list compactList">
            {savings.entries.slice(0, 8).map((entry) => (
              <li key={entry.id} className="listItem">
                <div>
                  <strong>{formatCurrency(entry.amount)}</strong>
                  <span className="muted">
                    {new Date(entry.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
