import { useState } from "react";

export function ImportTab({ loading, onImport }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      return;
    }

    setSubmitting(true);
    await onImport(file);
    setSubmitting(false);
    setFile(null);
    event.currentTarget.reset();
  }

  return (
    <section className="singleColumn">
      <article className="card">
        <h2>Importar Extrato</h2>
        <p className="muted">
          O sistema reconhece sinais negativos, parenteses e palavras-chave como
          PIX RECEBIDO, PAGAMENTO e COMPRA para classificar entradas e saídas.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Arquivo do extrato
            <input
              type="file"
              accept=".pdf,.csv,application/pdf,text/csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </label>
          <button type="submit" disabled={!file || submitting || loading}>
            {submitting ? "Processando..." : "Processar extrato"}
          </button>
        </form>
      </article>
    </section>
  );
}
