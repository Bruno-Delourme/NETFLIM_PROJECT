const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreur de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erreur de base de données
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Conflit de données',
      message: 'Cette ressource existe déjà'
    });
  }

  // Erreur de base de données générale
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      error: 'Erreur de base de données',
      message: 'Une erreur est survenue lors de l\'accès aux données'
    });
  }

  // Erreur de validation personnalisée
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: err.message
    });
  }

  // Erreur 404
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Ressource non trouvée',
      message: err.message || 'La ressource demandée n\'existe pas'
    });
  }

  // Erreur par défaut
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur interne est survenue' 
    : err.message;

  res.status(status).json({
    error: 'Erreur interne du serveur',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
