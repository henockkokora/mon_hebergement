// 404 handler
export function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: 'Route non trouvée' });
}

// Global error handler
export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Erreur de validation', details: err.errors });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Erreur serveur',
  });
}
