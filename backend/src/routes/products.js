// --- Recherche avancée MongoDB (ProductSearch) ---
const ProductSearch = require('../models/ProductSearch');
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, Category } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');
const { User } = require('../../models');
const emailService = require('../services/emailService');

// Ajouter ces imports pour l'upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/products/';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

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


// GET /api/products/search-mongo - Recherche avancée MongoDB
router.get('/search-mongo', async (req, res) => {
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

    const filter = { isActive: true };
    
    // Filtres Catégories
    if (category) filter['category.id'] = category;
    
    // Filtres Promotions
    if (onSale === 'true') filter.isOnSale = true;
    
    // Filtres Stock
    if (inStock === 'true') filter.stockQuantity = { $gt: 0 };
    
    // Filtres Prix
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Recherche textuelle
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Tri
    const sort = {};
    if (['price', 'name', 'createdAt'].includes(sortBy)) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProductSearch.countDocuments(filter);
    const products = await ProductSearch.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Mongo search error:', error);
    res.status(500).json({ success: false, message: 'Erreur recherche Mongo' });
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
router.post('/', authenticate, requirePermission('products:write'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('📤 FILES REÇUS:', req.files); // ← AJOUTER
    console.log('📤 BODY REÇU:', req.body);    // ← AJOUTER

    const {
      name,
      description,
      categoryId,
      price,
      salePrice,
      isOnSale = false,
      stockQuantity = 0,
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

    // Traiter les images uploadées
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];
    console.log('📸 IMAGES TRAITÉES:', images); // ← AJOUTER
    console.log('📸 NOMBRE D\'IMAGES:', req.files ? req.files.length : 0); // ← AJOUTER

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
      images, // ← Les images sont bien incluses
      slug,
      status,
      isActive
    });

    console.log('🗄️ PRODUIT CRÉÉ AVEC IMAGES:', product.images); // ← AJOUTER


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

    // Notifier tous les utilisateurs actifs (hors admin)
    const users = await User.findAll({ where: { isActive: true, role: 'ROLE_USER' } });
    for (const user of users) {
      // Envoi sans await pour ne pas bloquer la réponse
      emailService.sendNewProductAlert(user.email, createdProduct, user);
    }

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
router.put('/:id', authenticate, requirePermission('products:write'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('🔄 UPDATE REQUEST - ID:', req.params.id);
    console.log('🔄 UPDATE REQUEST - BODY:', req.body);
    console.log('🔄 UPDATE REQUEST - FILES:', req.files);

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

    // Gérer les nouvelles images uploadées
    let finalImages = product.images || [];

    // Si de nouvelles images ont été uploadées
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

      // Si images est fourni dans le body, on considère que c'est pour conserver certaines anciennes images
      if (images && Array.isArray(images)) {
        // Combiner les anciennes images conservées avec les nouvelles
        finalImages = [...images, ...newImageUrls];
      } else {
        // Remplacer toutes les images par les nouvelles
        finalImages = newImageUrls;
      }
    } else if (images && Array.isArray(images)) {
      // Si pas de nouvelles images mais images est fourni, utiliser celui-ci
      finalImages = images;
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      categoryId: categoryId || product.categoryId,
      price: price ? parseFloat(price) : product.price,
      salePrice: salePrice ? parseFloat(salePrice) : product.salePrice,
      isOnSale: isOnSale !== undefined ? isOnSale : product.isOnSale,
      stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : product.stockQuantity,
      images: finalImages,
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