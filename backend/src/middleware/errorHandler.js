export function errorHandler(error, req, res, next) {
  console.error("Erro na API:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.status || 500).json({
    error: error?.message || "Erro interno do servidor.",
  });
}
