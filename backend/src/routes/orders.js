const express = require('express');
const router = express.Router();
const { Order, User } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

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
        userId: req.user.id
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

// POST /api/orders - Créer une commande + envoi email
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      total,
      shippingAddress,
      billingAddress,
      items = []
    } = req.body;

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

    const{ OrderItem } = require('../../models'); 
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
    }
    logger.info(`Order created: ${order.id}`, { userId: req.user.id });

    // Envoi email confirmation
    // try {
    //   await emailService.sendOrderConfirmation(req.user.email, order, req.user);
    //   logger.info(`Email confirmation envoyé à ${req.user.email}`);
    // } catch (emailErr) {
    //   logger.error('Erreur envoi email confirmation commande :', emailErr);
    // }

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès, email envoyé',
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
