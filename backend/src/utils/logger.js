const winston = require('winston');
const path = require('path');

// Configuration des formats de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack 
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  })
);

// Configuration des transports
const transports = [
  // Console
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  }),

  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join('logs', 'app.log'),
    level: 'info',
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }),

  // Fichier spécifique pour les erreurs
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5
  })
];

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Gestion des exceptions non capturées
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join('logs', 'exceptions.log'),
    format: logFormat
  })
);

// Gestion des rejections non capturées
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join('logs', 'rejections.log'),
    format: logFormat
  })
);

// Ajout de métadonnées contextuelles
logger.defaultMeta = {
  service: 'ecommerce-api',
  version: '1.0.0'
};

// Création du dossier logs s'il n'existe pas
const fs = require('fs');
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Méthodes personnalisées pour différents types de logs
logger.auth = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'AUTH' });
};

logger.payment = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'PAYMENT' });
};

logger.order = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'ORDER' });
};

logger.security = (message, meta = {}) => {
  logger.warn(message, { ...meta, category: 'SECURITY' });
};

logger.rgpd = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'RGPD' });
};

logger.email = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'EMAIL' });
};

module.exports = logger; 