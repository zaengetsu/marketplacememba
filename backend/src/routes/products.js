const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, Category } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/products - Liste des produits (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      onSale,
      inStock,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtres
    if (category) {
      where.categoryId = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (onSale === 'true') {
      where.isOnSale = true;
    }

    if (inStock === 'true') {
      where.stockQuantity = { [Op.gt]: 0 };
    }

    // Recherche textuelle
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Tri
    const order = [];
    switch (sortBy) {
      case 'price':
        order.push(['price', sortOrder.toUpperCase()]);
        break;
      case 'name':
        order.push(['name', sortOrder.toUpperCase()]);
        break;
      case 'createdAt':
        order.push(['createdAt', sortOrder.toUpperCase()]);
        break;
      default:
        order.push(['name', 'ASC']);
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

// GET /api/products/:id - Détail d'un produit (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
});

// POST /api/products - Créer un produit (Admin/Store Keeper)
router.post('/', authenticate, requirePermission('products:write'), async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      price,
      salePrice,
      isOnSale = false,
      stockQuantity = 0,
      images = [],
      status = 'draft',
      isActive = false
    } = req.body;

    // Validation
    if (!name || !description || !categoryId || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nom, description, catégorie et prix sont requis'
      });
    }

    // Vérifier que la catégorie existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = await Product.create({
      name,
      description,
      categoryId,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      isOnSale,
      stockQuantity: parseInt(stockQuantity),
      images,
      slug,
      status,
      isActive
    });

    // Charger le produit avec ses relations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    logger.info(`Product created: ${product.id}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: createdProduct
    });

  } catch (error) {
    logger.error('Error creating product:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce nom existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit'
    });
  }
});

// PUT /api/products/:id - Modifier un produit (Admin/Store Keeper)
router.put('/:id', authenticate, requirePermission('products:write'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const {
      name,
      description,
      categoryId,
      price,
      salePrice,
      isOnSale,
      stockQuantity,
      images,
      status,
      isActive
    } = req.body;

    // Vérifier la catégorie si elle est modifiée
    if (categoryId && categoryId !== product.categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }
    }

    // Générer un nouveau slug si le nom change
    let slug = product.slug;
    if (name && name !== product.name) {
      slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      categoryId: categoryId || product.categoryId,
      price: price ? parseFloat(price) : product.price,
      salePrice: salePrice ? parseFloat(salePrice) : product.salePrice,
      isOnSale: isOnSale !== undefined ? isOnSale : product.isOnSale,
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : product.stockQuantity,
      images: images || product.images,
      slug,
      status: status || product.status,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    // Charger le produit mis à jour avec ses relations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    logger.info(`Product updated: ${product.id}`, { userId: req.user.id });

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
    });

  } catch (error) {
    logger.error('Error updating product:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce nom existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit'
    });
  }
});

// DELETE /api/products/:id - Supprimer un produit (Admin uniquement)
router.delete('/:id', authenticate, requirePermission('products:delete'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await product.destroy();

    logger.info(`Product deleted: ${req.params.id}`, { userId: req.user.id });

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit'
    });
  }
});

// PATCH /api/products/:id/toggle-status - Activer/Désactiver un produit
router.patch('/:id/toggle-status', authenticate, requirePermission('products:write'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await product.update({
      isActive: !product.isActive,
      status: !product.isActive ? 'active' : 'inactive'
    });

    logger.info(`Product status toggled: ${req.params.id}`, { 
      userId: req.user.id,
      newStatus: product.isActive 
    });

    res.json({
      success: true,
      message: `Produit ${product.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive: product.isActive, status: product.status }
    });

  } catch (error) {
    logger.error('Error toggling product status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
});

// GET /api/products/admin/all - Liste complète pour l'admin
router.get('/admin/all', authenticate, requirePermission('products:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtres admin
    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Tri
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
});

module.exports = router; 