const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

require('dotenv').config();

console.log('🔄 Chargement des modules...');

const connectDB = require('./database/connection');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

console.log('✅ Modules chargés, début de l\'initialisation...');

const app = express();

console.log('🚀 Application Express créée');

// Connexion à la base de données AVANT d'importer les routes
console.log('🔄 Connexion à la base de données...');
connectDB();

// Import des routes APRÈS la connexion DB
console.log('🔄 Import des routes...');
let authRoutes, userRoutes, productRoutes, categoryRoutes, cartRoutes, orderRoutes;
let paymentRoutes, invoiceRoutes, stockRoutes, alertRoutes, adminRoutes, rgpdRoutes, webhookRoutes;

try {
  console.log('  - auth routes...');
  authRoutes = require('./routes/auth');
  console.log('  - user routes...');
  userRoutes = require('./routes/users');
  console.log('  - product routes...');
  productRoutes = require('./routes/products');
  console.log('  - category routes...');
  categoryRoutes = require('./routes/categories');
  console.log('  - cart routes...');
  cartRoutes = require('./routes/cart');
  console.log('  - order routes...');
  orderRoutes = require('./routes/orders');
  console.log('  - payment routes...');
  paymentRoutes = require('./routes/payments');
  console.log('  - invoice routes...');
  invoiceRoutes = require('./routes/invoices');
  console.log('  - stock routes...');
  stockRoutes = require('./routes/stock');
  console.log('  - alert routes...');
  alertRoutes = require('./routes/alerts');
  console.log('  - admin routes...');
  adminRoutes = require('./routes/admin');
  console.log('  - rgpd routes...');
  rgpdRoutes = require('./routes/rgpd');
  console.log('  - webhook routes...');
  webhookRoutes = require('./routes/webhooks');
  console.log('✅ Toutes les routes importées avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'import des routes:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Configuration Redis pour les sessions (optionnelle)
let redisClient = null;
let redisStore = null;

if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.connect().then(() => {
      logger.info('Redis connected successfully');
      redisStore = new RedisStore({ client: redisClient });
    }).catch((err) => {
      logger.error('Redis connection failed:', err);
      logger.warn('Continuing without Redis - sessions will use memory store');
      redisClient = null;
    });
  } catch (error) {
    logger.error('Redis setup failed:', error);
    logger.warn('Continuing without Redis - sessions will use memory store');
    redisClient = null;
  }
} else {
  logger.warn('No REDIS_URL provided - using memory store for sessions');
}

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
}));

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (plus permissif en développement)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 en dev, 100 en prod
  message: {
    error: 'Trop de requêtes de votre part, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Logging des requêtes
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Compression des réponses
app.use(compression());

// Parse des cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Configuration des sessions (avec ou sans Redis)
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret-dev-only',
  resave: false,
  saveUninitialized: false,
  name: 'ecommerce.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: 'strict'
  }
};

// Utiliser Redis store si disponible, sinon memory store
if (redisStore) {
  sessionConfig.store = redisStore;
  logger.info('Using Redis store for sessions');
} else {
  logger.warn('Using memory store for sessions (not recommended for production)');
}

app.use(session(sessionConfig));

// Parse du JSON et des données de formulaire
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes API
console.log('🔄 Configuration des routes API...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rgpd', rgpdRoutes);
app.use('/api/webhooks', webhookRoutes);

console.log('✅ Routes API configurées');

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'API E-Commerce - Backend fonctionnel',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `Impossible de trouver ${req.originalUrl} sur ce serveur.`
  });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrage du serveur
console.log('🔄 Démarrage du serveur...');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
  logger.info(`🌍 Environnement: ${process.env.NODE_ENV}`);
  logger.info(`📊 API disponible sur http://localhost:${PORT}/api`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  logger.info(`Réception du signal ${signal}. Arrêt propre du serveur...`);
  
  server.close(() => {
    logger.info('Serveur HTTP fermé.');
    
    // Fermeture des connexions Redis si disponible
    if (redisClient) {
      redisClient.quit().then(() => {
        logger.info('Connexion Redis fermée.');
        process.exit(0);
      }).catch((err) => {
        logger.error('Erreur lors de la fermeture de Redis:', err);
        process.exit(1);
      });
    } else {
      logger.info('Pas de connexion Redis à fermer.');
      process.exit(0);
    }
  });
}

module.exports = app; 