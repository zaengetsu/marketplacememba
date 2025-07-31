const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuration de la base de données
const config = require('../../config/config.json')[process.env.NODE_ENV || 'development'];

// Création de l'instance Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false
  }
});

const connectDB = async () => {
  try {
    // Test de la connexion
    await sequelize.authenticate();
    logger.info(`PostgreSQL Connected: ${config.host}:${config.port}/${config.database}`);

    // Synchronisation des modèles (uniquement en développement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database synchronized');
    }

    // Configuration des événements de connexion
    sequelize.addHook('beforeConnect', () => {
      logger.debug('Attempting to connect to database...');
    });

    sequelize.addHook('afterConnect', () => {
      logger.debug('Database connection established');
    });

    sequelize.addHook('beforeDisconnect', () => {
      logger.debug('Disconnecting from database...');
    });

  } catch (error) {
    logger.error('Error connecting to PostgreSQL:', error);
    process.exit(1);
  }
};

// Fonction pour fermer la connexion proprement
const closeDB = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
module.exports.closeDB = closeDB; 