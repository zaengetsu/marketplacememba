const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Product, Order } = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { requirePermission } = require('../middlewares/roleAuth');
const logger = require('../utils/logger');

// GET /api/admin/dashboard - Statistiques dashboard
router.get('/dashboard', authenticate, requirePermission('analytics:read'), async (req, res) => {
  try {
    // Statistiques basiques
    const stats = {
      users: {
        total: await User.count(),
        active: await User.count({ where: { isActive: true } }),
        newThisWeek: await User.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      },
      products: {
        total: await Product.count(),
        //active: await Product.count({ where: { isActive: true } }),
        lowStock: await Product.count({
          where: {
            stockQuantity: { [Op.lt]: 10 }
          }
        })
      },
      orders: {
        total: await Order.count(),
        pending: await Order.count({ where: { status: 'pending' } }),
        thisMonth: await Order.count({
          where: {
            createdAt: {
              [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        })
      },
      revenue: await Order.sum('total', {
        where: {
          status: 'pending',
          createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      }) || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/admin/users - Gestion utilisateurs
router.get('/users', authenticate, requirePermission('users:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

// PATCH /api/admin/users/:id/toggle-status - Activer/Désactiver un utilisateur
router.patch('/users/:id/toggle-status', authenticate, requirePermission('users:write'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    await user.update({
      isActive: !user.isActive
    });

    logger.info(`User status toggled: ${req.params.id}`, {
      adminId: req.user.id,
      newStatus: user.isActive
    });

    res.json({
      success: true,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      data: { isActive: user.isActive }
    });

  } catch (error) {
    logger.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
});

// Nouveaux utilisateurs par jour (7 derniers jours)
router.get('/stats/users-per-day', authenticate, requirePermission('analytics:read'), async (req, res) => {
  const { User } = require('../../models');
  const { Op } = require('sequelize');
  const days = 7;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));
    const count = await User.count({
      where: {
        createdAt: { [Op.between]: [start, end] }
      }
    });
    result.push({ date: start.toISOString().slice(0, 10), count });
  }
  res.json({ success: true, data: result });
});

// Commandes par statut
router.get('/stats/orders-by-status', authenticate, requirePermission('analytics:read'), async (req, res) => {
  const { Order } = require('../../models');
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  const data = {};
  for (const status of statuses) {
    data[status] = await Order.count({ where: { status } });
  }
  res.json({ success: true, data });
});

// CA par mois (6 derniers mois)
router.get('/stats/revenue-per-month', authenticate, requirePermission('analytics:read'), async (req, res) => {
  const { Order } = require('../../models');
  const { Op } = require('sequelize');
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const sum = await Order.sum('total', {
      where: {
        status: 'delivered',
        createdAt: { [Op.gte]: month, [Op.lt]: nextMonth }
      }
    });
    result.push({ month: month.toISOString().slice(0, 7), revenue: sum || 0 });
  }
  res.json({ success: true, data: result });
});

// GET /api/admin/orders - Liste paginée, recherche, filtre
router.get('/orders', authenticate, requirePermission('orders:read'), async (req, res) => {
  try {
    const { Order, User } = require('../../models');
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    const userWhere = {};

    if (status) where.status = status;
    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
        // Ajoute { email: { [Op.iLike]: `%${search}%` } } si tu veux chercher sur l'email aussi
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName'],
          where: Object.keys(userWhere).length ? userWhere : undefined
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
  console.error('Erreur /admin/orders :', error); // <-- Ajoute cette ligne
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

// POST /api/admin/users - Créer un nouvel utilisateur (avec email de confirmation)
router.post('/users', authenticate, requirePermission('users:write'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Champs manquants' });
    }
    // Vérifie si l'email existe déjà
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
    }
    // Hash du mot de passe
    const bcrypt = require('bcryptjs');
    const crypto = require('crypto');
    const emailService = require('../services/emailService');

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken
    });

    // Envoi de l'email de vérification
    await emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user
    );

    res.json({ success: true, data: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la création' });
  }
});

module.exports = router; 