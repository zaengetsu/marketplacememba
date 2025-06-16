const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const logger = require('../utils/logger');

// POST /api/payments/create-intent - Créer une intention de paiement Stripe
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'eur', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    // Ici vous intégrerez Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Stripe utilise les centimes
    //   currency,
    //   metadata: { orderId, userId: req.user.id }
    // });

    // Pour l'instant, simulation
    const paymentIntent = {
      id: 'pi_simulation_' + Date.now(),
      client_secret: 'pi_simulation_secret_' + Date.now(),
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method'
    };

    logger.info('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      userId: req.user.id,
      amount,
      orderId
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    });
  }
});

// POST /api/payments/confirm - Confirmer un paiement
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de paiement requis'
      });
    }

    // Ici vous récupérerez le statut depuis Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Simulation
    const paymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 5000, // 50.00 EUR
      currency: 'eur'
    };

    if (paymentIntent.status === 'succeeded') {
      logger.info('Payment confirmed', {
        paymentIntentId,
        userId: req.user.id,
        orderId
      });

      res.json({
        success: true,
        message: 'Paiement confirmé avec succès',
        data: {
          paymentIntentId,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100 // Reconvertir en euros
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Paiement non confirmé',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    });
  }
});

// GET /api/payments/history - Historique des paiements de l'utilisateur
router.get('/history', authenticate, async (req, res) => {
  try {
    // Ici vous récupéreriez l'historique depuis votre base de données
    // const payments = await Payment.findAll({ where: { userId: req.user.id } });

    // Simulation
    const payments = [
      {
        id: 1,
        orderId: 123,
        amount: 45.99,
        currency: 'eur',
        status: 'succeeded',
        createdAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
});

module.exports = router; 