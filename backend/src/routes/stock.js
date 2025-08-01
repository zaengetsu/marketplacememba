const express = require('express');
const router = express.Router();
const { Product } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/stock - Stock des produits
router.get('/', authenticate, requirePermission('products:read'), async (req, res) => {
  try {
    // Pour Sequelize :
    const products = await Product.findAll({
      attributes: ['id', 'name', 'stockQuantity'],
      order: [['stockQuantity', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    logger.error('Error fetching stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du stock'
    });
  }
});

module.exports = router; 