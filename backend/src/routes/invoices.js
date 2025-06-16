const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Invoice, Order } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/invoices - Factures de l'utilisateur connecté
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtrer par statut si fourni
    if (status) {
      where.status = status;
    }

    // Pour les utilisateurs normaux, on ne montre que leurs factures
    // (via leurs commandes)
    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          where: { userId: req.user.id }, // Seulement les commandes de l'utilisateur
          attributes: ['id', 'total', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures'
    });
  }
});

// GET /api/invoices/:id - Détail d'une facture
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Order,
          as: 'order',
          where: { userId: req.user.id }, // Vérifier que l'utilisateur possède la commande
          attributes: ['id', 'total', 'shippingAddress', 'billingAddress', 'createdAt']
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la facture'
    });
  }
});

// POST /api/invoices - Créer une facture (Admin/Compta)
router.post('/', authenticate, requirePermission('invoices:write'), async (req, res) => {
  try {
    const {
      orderId,
      amount,
      dueAt
    } = req.body;

    // Validation
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande et montant requis'
      });
    }

    // Vérifier que la commande existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${orderId}`;

    const invoice = await Invoice.create({
      orderId,
      invoiceNumber,
      amount: parseFloat(amount),
      status: 'draft',
      issuedAt: new Date(),
      dueAt: dueAt ? new Date(dueAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
    });

    logger.info(`Invoice created: ${invoice.id}`, { 
      adminId: req.user.id,
      orderId,
      amount 
    });

    res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: invoice
    });

  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la facture'
    });
  }
});

// PATCH /api/invoices/:id/status - Modifier le statut d'une facture (Admin/Compta)
router.patch('/:id/status', authenticate, requirePermission('invoices:write'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
        validStatuses
      });
    }

    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    // Si le statut passe à "paid", enregistrer la date de paiement
    const updateData = { status };
    if (status === 'paid' && !invoice.paidAt) {
      updateData.paidAt = new Date();
    }

    await invoice.update(updateData);

    logger.info(`Invoice status updated: ${req.params.id}`, { 
      adminId: req.user.id,
      oldStatus: invoice.status,
      newStatus: status 
    });

    res.json({
      success: true,
      message: 'Statut de la facture mis à jour avec succès',
      data: {
        id: invoice.id,
        status: invoice.status,
        paidAt: invoice.paidAt
      }
    });

  } catch (error) {
    logger.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

// GET /api/invoices/admin/all - Toutes les factures (Admin/Compta)
router.get('/admin/all', authenticate, requirePermission('invoices:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'userId', 'total', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching all invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures'
    });
  }
});

module.exports = router; 