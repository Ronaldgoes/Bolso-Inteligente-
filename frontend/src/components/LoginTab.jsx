import { useState } from "react";

export function LoginTab({ onSubmit, loading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(mode, form);
  }

  return (
    <section className="authWrap">
      <article className="card authCard">
        <div className="listHeader">
          <h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2>
          <button
            type="button"
            className="secondary"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Criar conta" : "Ja tenho conta"}
          </button>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Registrar"}
          </button>
        </form>
      </article>
    </section>
  );
}
