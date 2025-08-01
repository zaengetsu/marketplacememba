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

    // Vérification du stock avant création de la commande
    const { Product, OrderItem } = require('../../models');
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Produit introuvable (ID: ${item.productId})`
        });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour le produit ${product.name} (disponible: ${product.stockQuantity}, demandé: ${item.quantity})`
        });
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      total: parseFloat(total),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      status: 'pending'
    });

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

// PUT /api/orders/:id/status - Modifier le statut d'une commande (Admin uniquement)
router.put('/:id/status', authenticate, requirePermission('orders:write'), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Statuts valides
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Statuts autorisés: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Envoyer un email de notification à l'utilisateur
    if (order.user && order.user.email) {
      try {
        await emailService.sendOrderStatusUpdate(order.user.email, order, oldStatus, status);
      } catch (emailError) {
        logger.error('Error sending status update email:', emailError);
        // Ne pas faire échouer la requête si l'email échoue
      }
    }

    logger.info(`Order status updated: ${order.id} from ${oldStatus} to ${status}`, { 
      userId: req.user.id,
      orderId: order.id,
      oldStatus,
      newStatus: status
    });

    res.json({
      success: true,
      message: `Statut de la commande mis à jour: ${status}`,
      data: order
    });

  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

module.exports = router;
