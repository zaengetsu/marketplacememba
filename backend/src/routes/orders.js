const express = require('express');
const router = express.Router();
const { Order, User } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/orders - Commandes de l'utilisateur connecté
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// GET /api/orders/:id - Détail d'une commande
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id  // L'utilisateur ne peut voir que ses commandes
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande'
    });
  }
});

// POST /api/orders - Créer une commande
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      total,
      shippingAddress,
      billingAddress,
      items = []
    } = req.body;

    // Validation basique
    if (!total || !shippingAddress || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Total, adresse de livraison et articles requis'
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      total: parseFloat(total),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      status: 'pending'
    });

    logger.info(`Order created: ${order.id}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: order
    });

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
});

// GET /api/orders/admin/all - Toutes les commandes (Admin)
router.get('/admin/all', authenticate, requirePermission('orders:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

module.exports = router; 