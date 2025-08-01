const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// POST /api/webhooks/stripe - Webhook Stripe
router.post('/stripe', express.raw({type: 'application/json'}), (req, res) => {
  try {
    logger.info('Stripe webhook received', { 
      type: req.body?.type || 'unknown',
      id: req.body?.id || 'unknown'
    });

    // Décrémentation du stock lors d'un paiement réussi
    if (req.body?.type === 'checkout.session.completed') {
      const session = req.body.data?.object;
      const orderId = session?.metadata?.orderId;
      if (orderId) {
        const { Order, OrderItem, Product } = require('../../models');
        Order.findOne({ where: { id: orderId } }).then(async (order) => {
          if (!order) return;
          const items = await OrderItem.findAll({ where: { orderId: order.id } });
          for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
              product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
              await product.save();
              logger.info(`Stock décrémenté pour le produit ${product.id}: -${item.quantity}`);
            }
          }
        }).catch((err) => {
          logger.error('Erreur décrémentation stock:', err);
        });
      }
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// POST /api/webhooks/paypal - Webhook PayPal
router.post('/paypal', (req, res) => {
  try {
    // Ici vous traiterez les webhooks PayPal
    logger.info('PayPal webhook received', { 
      type: req.body?.event_type || 'unknown'
    });

    res.json({ received: true });

  } catch (error) {
    logger.error('PayPal webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router; 