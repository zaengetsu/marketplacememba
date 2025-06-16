const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// POST /api/webhooks/stripe - Webhook Stripe
router.post('/stripe', express.raw({type: 'application/json'}), (req, res) => {
  try {
    // Ici vous traiterez les webhooks Stripe
    logger.info('Stripe webhook received', { 
      type: req.body?.type || 'unknown',
      id: req.body?.id || 'unknown'
    });

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