const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      statusCode: 400,
      message: `Erreur de validation: ${message}`
    };
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = {
      statusCode: 400,
      message: `La valeur '${value}' existe déjà pour le champ '${field}'`
    };
  }

  // Erreur ObjectId Mongoose invalide
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: 'Identifiant invalide'
    };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token invalide'
    };
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expiré'
    };
  }

  // Erreur de limite de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 413,
      message: 'Fichier trop volumineux'
    };
  }

  // Erreur de paiement Stripe
  if (err.type && err.type.startsWith('Stripe')) {
    error = {
      statusCode: 400,
      message: `Erreur de paiement: ${err.message}`
    };
  }

  // Erreur de validation express-validator
  if (err.errors && Array.isArray(err.errors)) {
    const messages = err.errors.map(e => e.msg).join(', ');
    error = {
      statusCode: 400,
      message: `Erreur de validation: ${messages}`
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

module.exports = errorHandler; 