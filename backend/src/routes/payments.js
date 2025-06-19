const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middlewares/auth');
const { Order, OrderItem, Product } = require('../../models');
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

    // Appel réel à Stripe pour récupérer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      if (orderId) {
        const { Order, Invoice, User } = require('../../models');
        const emailService = require('../services/emailService');
        const order = await Order.findByPk(orderId);

        if (order) {
          await order.update({ status: 'confirmed' });

          // Création de la facture
          const invoiceNumber = `INV-${Date.now()}-${orderId}`;
          const invoice = await Invoice.create({
            orderId: order.id,
            invoiceNumber,
            amount: order.total,
            status: 'sent',
            issuedAt: new Date(),
            dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            paidAt: new Date()
          });

          logger.info('Invoice auto-created after payment', {
            orderId: order.id,
            invoiceNumber,
            amount: order.total
          });

          // Envoi de l'email de confirmation avec la facture
          const user = await User.findByPk(order.userId);
          if (user) {
            await emailService.sendOrderConfirmation(user.email, order, invoice);
          }
        }
      }

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
          amount: paymentIntent.amount / 100
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

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        as: 'orderItems', // <-- alias défini dans Order.hasMany
        include: [{
          model: Product,
          as: 'Product' // <-- alias défini dans OrderItem.belongsTo
        }]
      }]
    });
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    // Prépare les articles pour Stripe
      const line_items = order.orderItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.Product.name },
        unit_amount: Math.round(item.Product.price * 100), // prix en centimes
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: req.user.email,
      success_url: `http://localhost:5173/order-confirmation/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:5173/orders',
      metadata: { orderId: orderId }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    const { Order, Invoice, User } = require('../../models');
    const emailService = require('../services/emailService');

    // Met à jour la commande comme payée
    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'Product'
        }]
      }]
    });
    if (order) {
      await order.update({ status: 'confirmed' });

      // Crée la facture
      const invoiceNumber = `INV-${Date.now()}-${orderId}`;
      const invoice = await Invoice.create({
        orderId: order.id,
        invoiceNumber,
        amount: order.total,
        status: 'sent',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: new Date()
      });

      // Envoie l'email de confirmation
      const user = await User.findByPk(order.userId);
      if (user) {
        await emailService.sendOrderConfirmation(user.email, order, invoice);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router; 