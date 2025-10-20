// 404 handler
export function notFoundHandler(req, res, _next) {
  res.status(404).json({ message: 'Route non trouvée' });
}

// Global error handler
export function errorHandler(err, _req, res, _next) {
  console.error('Erreur serveur:', err);

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: 'Données invalides',
      errors: errors 
    });
  }

  // Erreurs de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ 
      message: `${field} déjà utilisé` 
    });
  }

  // Erreurs de cast MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'Format de données invalide' 
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token invalide' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Session expirée. Veuillez vous reconnecter.' 
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
  });
}
