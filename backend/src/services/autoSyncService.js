const syncService = require('./syncService');
const logger = require('../utils/logger');

class AutoSyncService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialisation de la synchronisation automatique
  async initialize() {
    if (this.isInitialized) {
      logger.warn('AutoSync already initialized');
      return;
    }

    try {
      // Importer les modèles Sequelize
      const { User, Product, Category, Order } = require('../../models');

      // Configuration des hooks pour les produits
      this.setupProductHooks(Product);
      
      // Configuration des hooks pour les utilisateurs
      this.setupUserHooks(User);
      
      // Configuration des hooks pour les catégories
      this.setupCategoryHooks(Category);

      // Synchronisation initiale
      await this.initialSync();

      // Démarrer la synchronisation périodique
      this.startPeriodicSync();

      this.isInitialized = true;
      logger.info('AutoSync service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize AutoSync service:', error);
      throw error;
    }
  }

  // Hooks pour les produits
  setupProductHooks(Product) {
    // Après création
    Product.addHook('afterCreate', async (product, options) => {
      try {
        logger.info(`Product created: ${product.id}, syncing to MongoDB...`);
        await syncService.syncProduct(product.id);
        logger.info(`✅ Product ${product.id} synced to MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to sync product ${product.id} after create:`, error);
      }
    });

    // Après mise à jour
    Product.addHook('afterUpdate', async (product, options) => {
      try {
        logger.info(`Product updated: ${product.id}, syncing to MongoDB...`);
        await syncService.syncProduct(product.id);
        logger.info(`✅ Product ${product.id} updated in MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to sync product ${product.id} after update:`, error);
      }
    });

    // Après suppression
    Product.addHook('afterDestroy', async (product, options) => {
      try {
        logger.info(`Product deleted: ${product.id}, removing from MongoDB...`);
        const ProductSearch = require('../models/ProductSearch');
        await ProductSearch.deleteOne({ productId: product.id });
        logger.info(`✅ Product ${product.id} removed from MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to remove product ${product.id} from MongoDB:`, error);
      }
    });

    logger.info('Product hooks configured for auto-sync');
  }

  // Hooks pour les utilisateurs
  setupUserHooks(User) {
    // Après création
    User.addHook('afterCreate', async (user, options) => {
      try {
        logger.info(`User created: ${user.id}, syncing to MongoDB...`);
        await this.syncUser(user.id);
        logger.info(`✅ User ${user.id} synced to MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to sync user ${user.id} after create:`, error);
      }
    });

    // Après mise à jour
    User.addHook('afterUpdate', async (user, options) => {
      try {
        logger.info(`User updated: ${user.id}, syncing to MongoDB...`);
        await this.syncUser(user.id);
        logger.info(`✅ User ${user.id} updated in MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to sync user ${user.id} after update:`, error);
      }
    });

    // Après suppression
    User.addHook('afterDestroy', async (user, options) => {
      try {
        logger.info(`User deleted: ${user.id}, removing from MongoDB...`);
        const UserSearch = require('../models/UserSearch');
        await UserSearch.deleteOne({ userId: user.id });
        logger.info(`✅ User ${user.id} removed from MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to remove user ${user.id} from MongoDB:`, error);
      }
    });

    logger.info('User hooks configured for auto-sync');
  }

  // Hooks pour les catégories
  setupCategoryHooks(Category) {
    // Après création/mise à jour
    const syncCategory = async (category) => {
      try {
        logger.info(`Category ${category.id} changed, updating products in MongoDB...`);
        await syncService.syncCategories();
        logger.info(`✅ Category ${category.id} synced to MongoDB`);
      } catch (error) {
        logger.error(`❌ Failed to sync category ${category.id}:`, error);
      }
    };

    Category.addHook('afterCreate', syncCategory);
    Category.addHook('afterUpdate', syncCategory);
    Category.addHook('afterDestroy', syncCategory);

    logger.info('Category hooks configured for auto-sync');
  }

  // Synchronisation d'un utilisateur spécifique
  async syncUser(userId) {
    try {
      const { User } = require('../../models');
      const UserSearch = require('../models/UserSearch');

      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt']
      });

      if (!user) {
        await UserSearch.deleteOne({ userId });
        return;
      }

      const mongoUser = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        searchTerms: [
          user.firstName?.toLowerCase(),
          user.lastName?.toLowerCase(),
          user.email?.toLowerCase(),
          `${user.firstName} ${user.lastName}`.toLowerCase()
        ].filter(Boolean),
        updatedAt: new Date()
      };

      await UserSearch.findOneAndUpdate(
        { userId },
        mongoUser,
        { upsert: true, new: true }
      );

    } catch (error) {
      logger.error(`User sync failed for ${userId}:`, error);
      throw error;
    }
  }

  // Synchronisation initiale au démarrage
  async initialSync() {
    try {
      logger.info('Starting initial sync...');
      await syncService.fullSync();
      logger.info('✅ Initial sync completed');
    } catch (error) {
      logger.error('❌ Initial sync failed:', error);
      // Ne pas faire échouer le démarrage pour une erreur de sync
    }
  }

  // Synchronisation périodique
  startPeriodicSync() {
    // Sync complète toutes les heures
    setInterval(async () => {
      try {
        logger.info('Starting periodic sync...');
        await syncService.fullSync();
        logger.info('✅ Periodic sync completed');
      } catch (error) {
        logger.error('❌ Periodic sync failed:', error);
      }
    }, 60 * 60 * 1000); // 1 heure

    logger.info('Periodic sync started (every 1 hour)');
  }

  // Forcer une synchronisation manuelle
  async forceSyncAll() {
    try {
      logger.info('Starting manual full sync...');
      await syncService.fullSync();
      logger.info('✅ Manual sync completed');
      return { success: true, message: 'Synchronisation terminée' };
    } catch (error) {
      logger.error('❌ Manual sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Statistiques de synchronisation
  async getSyncStats() {
    try {
      const { User, Product, Category } = require('../../models');
      const ProductSearch = require('../models/ProductSearch');
      const UserSearch = require('../models/UserSearch');

      const [
        postgresUsers,
        postgresProducts,
        postgresCategories,
        mongoProducts,
        mongoUsers
      ] = await Promise.all([
        User.count(),
        Product.count(),
        Category.count(),
        ProductSearch.countDocuments(),
        UserSearch.countDocuments()
      ]);

      return {
        postgres: {
          users: postgresUsers,
          products: postgresProducts,
          categories: postgresCategories
        },
        mongodb: {
          products: mongoProducts,
          users: mongoUsers
        },
        syncStatus: {
          products: postgresProducts === mongoProducts ? 'synced' : 'out_of_sync',
          users: postgresUsers === mongoUsers ? 'synced' : 'out_of_sync'
        }
      };
    } catch (error) {
      logger.error('Failed to get sync stats:', error);
      throw error;
    }
  }
}

module.exports = new AutoSyncService(); 