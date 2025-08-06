const { User, Product, Category, Order } = require('../../models');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Modèles MongoDB pour la recherche
const ProductSearch = require('../models/ProductSearch');
const UserSearch = require('../models/UserSearch');

class SyncService {
  constructor() {
    this.isRunning = false;
  }

  // Synchronisation complète
  async fullSync() {
    if (this.isRunning) {
      logger.warn('Sync already running, skipping...');
      return;
    }

    this.isRunning = true;
    logger.info('Starting full sync PostgreSQL → MongoDB');

    try {
      await this.syncProducts();
      await this.syncUsers();
      await this.syncCategories();
      
      logger.info('Full sync completed successfully');
    } catch (error) {
      logger.error('Full sync failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Synchronisation des produits
  async syncProducts() {
    try {
      logger.info('Syncing products...');
      
      // Récupérer tous les produits de PostgreSQL
      const products = await Product.findAll({
        include: [
          { model: Category, as: 'category' }
        ]
      });

      // Vider la collection MongoDB
      await ProductSearch.deleteMany({});

      // Insérer les produits dans MongoDB pour la recherche
      const mongoProducts = products.map(product => ({
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stockQuantity: product.stockQuantity,
        images: product.images && Array.isArray(product.images)
          ? product.images.map(img =>
              typeof img === 'object' && img !== null
                ? {
                    url: img.url || (typeof img === 'string' ? img : ''),
                    alt: img.alt || product.name,
                    isPrimary: img.isPrimary || false
                  }
                : { url: img, alt: product.name, isPrimary: false }
            )
          : [],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null,
        searchTerms: this.generateSearchTerms(product),
        isActive: product.isActive || true,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      if (mongoProducts.length > 0) {
        logger.info('Produits à insérer dans MongoDB:', JSON.stringify(mongoProducts, null, 2));
        const insertResult = await ProductSearch.insertMany(mongoProducts);
        logger.info(`Résultat insertMany: ${JSON.stringify(insertResult, null, 2)}`);
      } else {
        logger.warn('Aucun produit à insérer dans MongoDB (mongoProducts est vide)');
      }

      logger.info(`Synced ${products.length} products`);
    } catch (error) {
      logger.error('Product sync failed:', error);
      throw error;
    }
  }

  // Synchronisation des utilisateurs (données anonymisées pour la recherche)
  async syncUsers() {
    try {
      logger.info('Syncing users...');
      
      const users = await User.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt']
      });

      await UserSearch.deleteMany({});

      const mongoUsers = users.map(user => ({
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
        createdAt: user.createdAt
      }));

      if (mongoUsers.length > 0) {
        await UserSearch.insertMany(mongoUsers);
      }

      logger.info(`Synced ${users.length} users`);
    } catch (error) {
      logger.error('User sync failed:', error);
      throw error;
    }
  }

  // Synchronisation des catégories
  async syncCategories() {
    try {
      logger.info('Syncing categories...');
      
      const categories = await Category.findAll();
      
      // Utiliser la collection products pour mettre à jour les catégories
      for (const category of categories) {
        await ProductSearch.updateMany(
          { 'category.id': category.id },
          {
            $set: {
              'category.name': category.name,
              'category.slug': category.slug
            }
          }
        );
      }

      logger.info(`Synced ${categories.length} categories`);
    } catch (error) {
      logger.error('Category sync failed:', error);
      throw error;
    }
  }

  // Synchronisation d'un produit spécifique
  async syncProduct(productId) {
    try {
      const product = await Product.findByPk(productId, {
        include: [{ model: Category, as: 'category' }]
      });

      if (!product) {
        await ProductSearch.deleteOne({ productId });
        return;
      }

      const mongoProduct = {
        productId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        stockQuantity: product.stockQuantity,
        images: product.images && Array.isArray(product.images)
          ? product.images.map(img =>
              typeof img === 'object' && img !== null
                ? {
                    url: img.url || (typeof img === 'string' ? img : ''),
                    alt: img.alt || product.name,
                    isPrimary: img.isPrimary || false
                  }
                : { url: img, alt: product.name, isPrimary: false }
            )
          : [],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null,
        searchTerms: this.generateSearchTerms(product),
        isActive: product.isActive || true,
        updatedAt: new Date()
      };

      await ProductSearch.findOneAndUpdate(
        { productId },
        mongoProduct,
        { upsert: true, new: true }
      );

      logger.info(`Synced product ${productId}`);
    } catch (error) {
      logger.error(`Product sync failed for ${productId}:`, error);
      throw error;
    }
  }

  // Génération des termes de recherche
  generateSearchTerms(product) {
    const terms = [];
    
    if (product.name) {
      terms.push(product.name.toLowerCase());
      terms.push(...product.name.toLowerCase().split(' '));
    }
    
    if (product.description) {
      terms.push(...product.description.toLowerCase().split(' ').slice(0, 10));
    }
    
    if (product.category?.name) {
      terms.push(product.category.name.toLowerCase());
    }

    // Supprimer les doublons et les termes trop courts
    return [...new Set(terms)].filter(term => term.length > 2);
  }

  // Synchronisation automatique (hooks Sequelize)
  setupHooks() {
    // Hook après création de produit
    Product.addHook('afterCreate', async (product) => {
      try {
        await this.syncProduct(product.id);
      } catch (error) {
        logger.error('Hook sync failed after create:', error);
      }
    });

    // Hook après mise à jour de produit
    Product.addHook('afterUpdate', async (product) => {
      try {
        await this.syncProduct(product.id);
      } catch (error) {
        logger.error('Hook sync failed after update:', error);
      }
    });

    // Hook après suppression de produit
    Product.addHook('afterDestroy', async (product) => {
      try {
        await ProductSearch.deleteOne({ productId: product.id });
        logger.info(`Removed product ${product.id} from search index`);
      } catch (error) {
        logger.error('Hook sync failed after destroy:', error);
      }
    });

    logger.info('Sequelize hooks setup for auto-sync');
  }

  // Synchronisation périodique
  startPeriodicSync(intervalMinutes = 60) {
    setInterval(async () => {
      try {
        await this.fullSync();
      } catch (error) {
        logger.error('Periodic sync failed:', error);
      }
    }, intervalMinutes * 60 * 1000);

    logger.info(`Periodic sync started (every ${intervalMinutes} minutes)`);
  }
}

module.exports = new SyncService(); 