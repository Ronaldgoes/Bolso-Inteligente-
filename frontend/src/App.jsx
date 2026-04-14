import { useEffect, useMemo, useState } from "react";
import {
  clearAuth,
  createDebt,
  createGoal,
  createTransaction,
  deleteDebt,
  deleteGoal,
  deleteTransaction,
  getDebts,
  getGoals,
  getSavingsSummary,
  getSettings,
  getTransactionSummary,
  getTransactions,
  importStatement,
  login,
  readAuth,
  register,
  saveAuth,
  updateDebt,
  updateGoal,
  updateSettings,
} from "./api.js";
import { TabNavigation } from "./components/TabNavigation.jsx";
import { DashboardTab } from "./components/DashboardTab.jsx";
import { TransactionsTab } from "./components/TransactionsTab.jsx";
import { ImportTab } from "./components/ImportTab.jsx";
import { GoalsTab } from "./components/GoalsTab.jsx";
import { SavingsTab } from "./components/SavingsTab.jsx";
import { DebtsTab } from "./components/DebtsTab.jsx";
import { LoginTab } from "./components/LoginTab.jsx";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "transactions", label: "Transacoes" },
  { id: "import", label: "Importar Extrato" },
  { id: "goals", label: "Metas" },
  { id: "savings", label: "Guardado" },
  { id: "debts", label: "Dividas" },
  { id: "login", label: "Login" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("login");
  const [auth, setAuth] = useState(readAuth());
  const [transactions, setTransactions] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({});
  const [goals, setGoals] = useState([]);
  const [savings, setSavings] = useState({
    totalSaved: 0,
    monthlySaved: 0,
    savingsPercent: 10,
    entries: [],
  });
  const [settings, setSettingsState] = useState({
    savingsPercent: 10,
  });
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (auth?.token) {
      setActiveTab("dashboard");
      loadAllData();
    } else {
      setActiveTab("login");
      setTransactions([]);
      setTransactionSummary({});
      setGoals([]);
      setSavings({
        totalSaved: 0,
        monthlySaved: 0,
        savingsPercent: 10,
        entries: [],
      });
      setSettingsState({ savingsPercent: 10 });
      setDebts([]);
    }
  }, [auth?.token]);

  async function loadAllData() {
    if (!auth?.token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        transactionsData,
        summaryData,
        goalsData,
        savingsData,
        settingsData,
        debtsData,
      ] = await Promise.all([
        getTransactions(),
        getTransactionSummary(),
        getGoals(),
        getSavingsSummary(),
        getSettings(),
        getDebts(),
      ]);

      setTransactions(transactionsData);
      setTransactionSummary(summaryData);
      setGoals(goalsData);
      setSavings(savingsData);
      setSettingsState(settingsData);
      setDebts(debtsData);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        setError("Sua sessao expirou. Faca login novamente.");
      } else {
        setError("Nao foi possivel carregar os dados do aplicativo.");
      }
    } finally {
      setLoading(false);
    }
  }

  function clearMessages() {
    setError("");
    setNotice("");
  }

  function handleLogout() {
    clearAuth();
    setAuth(null);
    setActiveTab("login");
  }

  async function handleAuth(mode, payload) {
    clearMessages();

    try {
      const result = mode === "register" ? await register(payload) : await login(payload);
      saveAuth(result);
      setAuth(result);
      setNotice(mode === "register" ? "Conta criada com sucesso." : "Login realizado com sucesso.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ?? "Nao foi possivel autenticar.",
      );
    }
  }

  async function refreshAfter(action, successMessage) {
    try {
      await action();
      setNotice(successMessage);
      await loadAllData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ?? "Nao foi possivel concluir a operacao.",
      );
    }
  }

  async function handleCreateTransaction(payload) {
    clearMessages();
    await refreshAfter(
      () => createTransaction(payload),
      "Transacao adicionada com sucesso.",
    );
  }

  async function handleDeleteTransaction(id) {
    clearMessages();
    await refreshAfter(
      () => deleteTransaction(id),
      "Transacao excluida com sucesso.",
    );
  }

  async function handleImport(file) {
    clearMessages();

    try {
      const result = await importStatement(file);
      setNotice(`${result.inserted} transacao(oes) importada(s) com sucesso.`);
      await loadAllData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ??
          "Nao foi possivel processar o extrato.",
      );
    }
  }

  async function handleCreateGoal(payload) {
    clearMessages();
    await refreshAfter(() => createGoal(payload), "Meta criada com sucesso.");
  }

  async function handleUpdateGoal(id, payload) {
    clearMessages();
    await refreshAfter(() => updateGoal(id, payload), "Meta atualizada com sucesso.");
  }

  async function handleDeleteGoal(id) {
    clearMessages();
    await refreshAfter(() => deleteGoal(id), "Meta excluida com sucesso.");
  }

  async function handleUpdateSavingsPercent(percent) {
    clearMessages();
    await refreshAfter(
      () => updateSettings({ savingsPercent: percent }),
      "Percentual de economia atualizado.",
    );
  }

  async function handleCreateDebt(payload) {
    clearMessages();
    await refreshAfter(() => createDebt(payload), "Divida criada com sucesso.");
  }

  async function handleUpdateDebt(id, payload) {
    clearMessages();
    await refreshAfter(() => updateDebt(id, payload), "Divida atualizada com sucesso.");
  }

  async function handleDeleteDebt(id) {
    clearMessages();
    await refreshAfter(() => deleteDebt(id), "Divida excluida com sucesso.");
  }

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return key === currentMonthKey;
    });
  }, [transactions, currentMonthKey]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      return transaction.type === "income"
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [currentMonthTransactions]);

  const categorySummary = useMemo(() => {
    const summary = {};

    for (const transaction of currentMonthTransactions) {
      if (transaction.type !== "expense") {
        continue;
      }

      summary[transaction.category] =
        (summary[transaction.category] || 0) + transaction.amount;
    }

    return Object.entries(summary)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions]);

  const heroStats = {
    totalBalance,
    totalSaved: savings.totalSaved,
    monthlyIncome: totalIncome,
    monthlyExpense: totalExpense,
    monthlySavings: savings.monthlySaved,
  };

  return (
    <main className="page">
      <section className="card hero">
        <div>
          <p className="eyebrow">Controle Financeiro</p>
          <h1>Painel financeiro profissional</h1>
          <p className="muted">
            Classifique extratos corretamente, acompanhe metas, dividas e
            economia mensal com autenticacao por usuario.
          </p>
          <p className="muted">
            {auth?.user?.email ? `Conta ativa: ${auth.user.email}` : "Nenhuma conta conectada."}
          </p>
        </div>
        <div className="heroStats">
          <div className="statPill">
            <span>Saldo total</span>
            <strong className={heroStats.totalBalance >= 0 ? "positive" : "negative"}>
              {formatCurrency(heroStats.totalBalance)}
            </strong>
          </div>
          <div className="statPill">
            <span>Economia do mes</span>
            <strong className="positive">{formatCurrency(heroStats.monthlySavings)}</strong>
          </div>
          {auth?.token ? (
            <button type="button" className="secondary" onClick={handleLogout}>
              Sair
            </button>
          ) : null}
        </div>
      </section>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        isAuthenticated={Boolean(auth?.token)}
      />

      {error ? <p className="error banner">{error}</p> : null}
      {notice ? <p className="success banner">{notice}</p> : null}

      {!auth?.token ? (
        <LoginTab onSubmit={handleAuth} loading={loading} />
      ) : null}

      {auth?.token && activeTab === "dashboard" ? (
        <DashboardTab
          loading={loading}
          transactionSummary={transactionSummary}
          categorySummary={categorySummary}
          goals={goals}
          debts={debts}
          heroStats={heroStats}
        />
      ) : null}

      {auth?.token && activeTab === "transactions" ? (
        <TransactionsTab
          loading={loading}
          transactions={transactions}
          transactionSummary={transactionSummary}
          onCreateTransaction={handleCreateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onRefresh={loadAllData}
        />
      ) : null}

      {auth?.token && activeTab === "import" ? (
        <ImportTab loading={loading} onImport={handleImport} />
      ) : null}

      {auth?.token && activeTab === "goals" ? (
        <GoalsTab
          goals={goals}
          onCreateGoal={handleCreateGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      ) : null}

      {auth?.token && activeTab === "savings" ? (
        <SavingsTab
          savings={savings}
          settings={settings}
          onUpdateSavingsPercent={handleUpdateSavingsPercent}
        />
      ) : null}

      {auth?.token && activeTab === "debts" ? (
        <DebtsTab
          debts={debts}
          onCreateDebt={handleCreateDebt}
          onUpdateDebt={handleUpdateDebt}
          onDeleteDebt={handleDeleteDebt}
        />
      ) : null}
    </main>
  );
}

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
