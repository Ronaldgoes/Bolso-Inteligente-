import { formatCurrency } from "../App.jsx";

function SimpleBars({ title, items, valueKey, labelKey }) {
  const max = Math.max(...items.map((item) => item[valueKey]), 1);

  return (
    <article className="card">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">Sem dados suficientes neste periodo.</p>
      ) : (
        <div className="chartStack">
          {items.map((item) => (
            <div key={item[labelKey]} className="chartRow">
              <div className="listHeader">
                <strong>{item[labelKey]}</strong>
                <span>{formatCurrency(item[valueKey])}</span>
              </div>
              <div className="progressBar">
                <div
                  className="progressValue"
                  style={{ width: `${(item[valueKey] / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function DashboardTab({
  loading,
  transactionSummary,
  categorySummary,
  goals,
  debts,
  heroStats,
}) {
  const monthlyEntries = Object.entries(transactionSummary)
    .map(([month, values]) => ({
      month,
      value: values.balance,
      income: values.income,
      expense: values.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const highlightedGoals = goals.slice(0, 3);
  const highlightedDebts = debts.slice(0, 3);

  return (
    <section className="dashboardGrid">
      <article className="card">
        <h2>Resumo do mes</h2>
        {loading ? <p className="muted">Carregando indicadores...</p> : null}
        <div className="metricGrid">
          <div className="metricCard">
            <span>Saldo total</span>
            <strong className={heroStats.totalBalance >= 0 ? "positive" : "negative"}>
              {formatCurrency(heroStats.totalBalance)}
            </strong>
          </div>
          <div className="metricCard">
            <span>Receita do mes</span>
            <strong className="positive">{formatCurrency(heroStats.monthlyIncome)}</strong>
          </div>
          <div className="metricCard">
            <span>Gasto do mes</span>
            <strong className="negative">{formatCurrency(heroStats.monthlyExpense)}</strong>
          </div>
          <div className="metricCard">
            <span>Economia do mes</span>
            <strong className="positive">{formatCurrency(heroStats.monthlySavings)}</strong>
          </div>
        </div>
      </article>

      <SimpleBars
        title="Gastos por categoria"
        items={categorySummary}
        valueKey="amount"
        labelKey="category"
      />

      <article className="card">
        <h2>Grafico mensal</h2>
        {monthlyEntries.length === 0 ? (
          <p className="muted">Nenhum historico mensal ainda.</p>
        ) : (
          <div className="chartStack">
            {monthlyEntries.map((entry) => (
              <div key={entry.month} className="chartRow">
                <div className="listHeader">
                  <strong>{entry.month}</strong>
                  <span className={entry.value >= 0 ? "positive" : "negative"}>
                    {formatCurrency(entry.value)}
                  </span>
                </div>
                <div className="miniStats">
                  <span>Receitas: {formatCurrency(entry.income)}</span>
                  <span>Despesas: {formatCurrency(entry.expense)}</span>
                </div>
                <div className="progressBar">
                  <div
                    className="progressValue"
                    style={{
                      width: `${Math.min((Math.abs(entry.value) / Math.max(...monthlyEntries.map((item) => Math.abs(item.value)), 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card">
        <h2>Metas em destaque</h2>
        {highlightedGoals.length === 0 ? (
          <p className="muted">Nenhuma meta cadastrada.</p>
        ) : (
          <div className="goalStack">
            {highlightedGoals.map((goal) => (
              <div key={goal.id} className="goalCard">
                <div className="listHeader">
                  <strong>{goal.name}</strong>
                  <span>{goal.progress.toFixed(0)}%</span>
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
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="card">
        <h2>Dividas</h2>
        {highlightedDebts.length === 0 ? (
          <p className="muted">Nenhuma divida cadastrada.</p>
        ) : (
          <ul className="list compactList">
            {highlightedDebts.map((debt) => (
              <li key={debt.id} className="listItem">
                <div>
                  <strong>{debt.name}</strong>
                  <span className="muted">
                    Restantes: {debt.installmentsRemaining} | Mensal: {formatCurrency(debt.monthlyAmount)}
                  </span>
                </div>
                <span>{debt.paid}/{debt.installments}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
